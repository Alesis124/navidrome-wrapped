import json
import os
import unittest
from unittest.mock import call, patch
from types import SimpleNamespace

os.environ["DATA_SOURCE"] = "api"
os.environ["CACHE_DIR"] = r"tests\api-cache-not-created"

from fastapi import HTTPException

from app import audio, main, navidrome_api


class Request:
    def __init__(self, body=None, cookies=None, origin="https://testserver", scheme="https"):
        self.payload = body or {}
        self.raw_body = json.dumps(self.payload).encode()
        self.headers = {
            "origin": origin,
            "host": "testserver",
            "content-length": str(len(self.raw_body)),
        }
        self.cookies = cookies or {}
        self.url = SimpleNamespace(scheme=scheme)

    async def json(self):
        return self.payload

    async def body(self):
        return self.raw_body

    async def stream(self):
        yield self.raw_body


class ApiUrlTests(unittest.TestCase):
    def test_normalizes_public_url_and_reverse_proxy_path(self):
        self.assertEqual(
            navidrome_api.validate_base_url("https://music.example.com/navidrome/"),
            "https://music.example.com/navidrome",
        )

    def test_rejects_unsafe_url_forms(self):
        for value in (
            "file:///etc/passwd",
            "http://music.example.com",
            "http://user:password@music.example.com",
            "https://music.example.com/?auth=secret",
            "http://music.example.com/a/../b",
            "https://localhost:4533",
        ):
            with self.subTest(value=value), self.assertRaises(navidrome_api.NavidromeError):
                navidrome_api.validate_base_url(value)

    def test_rejects_private_dns_and_accepts_public_dns(self):
        with patch("app.navidrome_api.socket.getaddrinfo", return_value=[
            (2, 1, 6, "", ("127.0.0.1", 443)),
        ]):
            with self.assertRaisesRegex(navidrome_api.NavidromeError, "public IP"):
                navidrome_api._resolve_public_address("music.example.com", 443)
        with patch("app.navidrome_api.socket.getaddrinfo", return_value=[
            (2, 1, 6, "", ("1.1.1.1", 443)),
        ]):
            self.assertEqual(navidrome_api._resolve_public_address("music.example.com", 443), "1.1.1.1")

    def test_rejects_localhost_resolution(self):
        with patch("app.navidrome_api.socket.getaddrinfo", return_value=[
            (2, 1, 6, "", ("127.0.0.1", 4533)),
        ]):
            with self.assertRaisesRegex(navidrome_api.NavidromeError, "public IP"):
                navidrome_api._resolve_public_address("localhost", 4533)

    def test_does_not_follow_redirects(self):
        class FakeResponse:
            status = 302

            def getheader(self, name):
                return "https://127.0.0.1/" if name == "Location" else None

        class FakeConnection:
            def __init__(self, *args, **kwargs):
                self.request_args = None

            def request(self, *args, **kwargs):
                self.request_args = (args, kwargs)

            def getresponse(self):
                return FakeResponse()

            def close(self):
                pass

        with patch("app.navidrome_api._resolve_public_address", return_value="1.1.1.1"), \
                patch("app.navidrome_api._PinnedHTTPSConnection", FakeConnection):
            with self.assertRaisesRegex(navidrome_api.NavidromeError, "redirected"):
                navidrome_api._post("https://music.example.com", "getMusicFolders", {})

    def test_api_summary_is_current_and_not_year_specific(self):
        session = navidrome_api.ApiSession(
            "https://music.example.com", "listener", "token", "salt", 9999999999,
        )
        with patch.object(navidrome_api, "_json_call", side_effect=[
            {"musicFolders": {"musicFolder": [{"name": "Library"}]}},
            {"albumList2": {"album": [{
                "name": "Album", "artist": "Artist", "coverArt": "cover-1",
            }]}},
        ]) as api_call:
            summary = navidrome_api.fetch_summary(session)
        self.assertEqual(summary["source"], "api")
        self.assertTrue(summary["limited"])
        self.assertNotIn("year", summary)
        self.assertNotIn("username", summary)
        self.assertEqual(summary["recent_albums"][0]["title"], "Album")
        self.assertIn("no calendar-year", summary["notice"])
        self.assertEqual(api_call.call_args_list, [
            call(session, "getMusicFolders"),
            call(session, "getAlbumList2", {"type": "newest", "size": "20"}),
        ])

    def test_api_import_does_not_create_disk_cache_directories(self):
        self.assertFalse(audio.CLIPS.exists())
        self.assertFalse(audio.COVERS.exists())
        self.assertFalse(audio.BLURS.exists())


class ApiSessionRouteTests(unittest.IsolatedAsyncioTestCase):
    async def test_credentials_are_not_returned_and_cookie_is_http_only_session_cookie(self):
        body = {
            "url": "https://music.example.com",
            "username": "listener",
            "password": "do-not-return-this",
        }
        summary = {"source": "api", "limited": True, "recent_albums": []}
        with patch.object(main, "DATA_SOURCE", "api"), patch.object(
            main.navidrome_api, "create_session", return_value=("opaque-session", summary)
        ):
            response = await main.api_source_session(Request(body))

        self.assertEqual(response.status_code, 200)
        self.assertNotIn(b"do-not-return-this", response.body)
        self.assertNotIn(b"listener", response.body)
        cookie = response.headers["set-cookie"].lower()
        self.assertIn("httponly", cookie)
        self.assertIn("samesite=strict", cookie)
        self.assertIn("secure", cookie)
        self.assertNotIn("max-age", cookie)
        self.assertNotIn("opaque-session", response.body.decode())

    async def test_rejects_cross_origin_session_submission(self):
        with patch.object(main, "DATA_SOURCE", "api"):
            with self.assertRaises(HTTPException) as error:
                await main.api_source_session(Request(
                    {"username": "listener", "password": "secret"},
                    origin="https://attacker.example",
                ))
        self.assertEqual(error.exception.status_code, 403)

    async def test_rejects_credentials_over_http(self):
        with patch.object(main, "DATA_SOURCE", "api"), patch.object(
            main.navidrome_api, "create_session"
        ) as create_session:
            with self.assertRaises(HTTPException) as error:
                await main.api_source_session(Request(
                    {"username": "listener", "password": "secret"},
                    origin="http://testserver", scheme="http",
                ))
        self.assertEqual(error.exception.status_code, 400)
        create_session.assert_not_called()

    async def test_untrusted_forwarded_https_header_does_not_enable_credentials_over_http(self):
        request = Request(
            {"username": "listener", "password": "secret"},
            origin="http://testserver", scheme="http",
        )
        request.headers["x-forwarded-proto"] = "https"
        with patch.object(main, "DATA_SOURCE", "api"), patch.object(
            main.navidrome_api, "create_session"
        ) as create_session:
            with self.assertRaises(HTTPException) as error:
                await main.api_source_session(request)
        self.assertEqual(error.exception.status_code, 400)
        create_session.assert_not_called()

    def test_api_theme_bundle_excludes_executable_theme_fields(self):
        theme = {
            "id": "custom", "name": "Custom", "tokens": {"--bg": "#000"},
            "fonts": [], "css": ["/themes/custom/theme.css"],
            "script": "/themes/custom/theme.js", "entry": "/themes/custom/theme.js",
            "engine": "react", "templates": {"intro": "script"},
        }
        with patch.object(main, "DATA_SOURCE", "api"), patch.object(
            main.themes, "load", return_value=theme
        ):
            result = main.theme_bundle("custom")
        self.assertEqual(set(result), {"id", "name", "tokens", "fonts", "css"})
        self.assertEqual(result["tokens"], {"--bg": "#000"})

    def test_api_theme_list_is_available(self):
        with patch.object(main, "DATA_SOURCE", "api"), patch.object(
            main.themes, "default_id", return_value="frequency"
        ), patch.object(main.themes, "list_themes", return_value=[{"id": "frequency"}]):
            result = main.themes_list()
        self.assertEqual(result, {"default": "frequency", "themes": [{"id": "frequency"}]})

    async def test_summary_requires_cookie_session(self):
        with patch.object(main, "DATA_SOURCE", "api"), patch.object(
            main.navidrome_api, "get_session", return_value=None
        ):
            with self.assertRaises(HTTPException) as error:
                await main.api_source_summary(Request())
        self.assertEqual(error.exception.status_code, 401)

    async def test_legacy_endpoint_is_disabled_in_api_mode(self):
        with patch.object(main, "DATA_SOURCE", "api"):
            with self.assertRaises(HTTPException) as error:
                main.users()
        self.assertEqual(error.exception.status_code, 409)


if __name__ == "__main__":
    unittest.main()
