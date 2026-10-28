# {year_expr}: columna con el año de lanzamiento (depende de la versión de Navidrome; NULL si no existe)
HISTORY_SCROBBLES = """
SELECT s.submission_time AS ts, {year_expr} AS rel_year,
       mf.id AS track_id, mf.title, mf.artist, mf.artist_id,
       mf.album, mf.album_id, mf.duration, mf.path,
       mf.created_at AS added_at
FROM scrobbles s
JOIN media_file mf ON mf.id = s.media_file_id
JOIN user u        ON u.id  = s.user_id
WHERE u.user_name = :user
"""

TOP_FALLBACK = """
SELECT mf.id AS track_id, mf.title, mf.artist, mf.artist_id,
       mf.album, mf.duration, mf.created_at AS added_at,
       a.play_count
FROM annotation a
JOIN media_file mf ON mf.id = a.item_id AND a.item_type = 'media_file'
JOIN user u        ON u.id  = a.user_id
WHERE u.user_name = :user AND a.play_count > 0
ORDER BY a.play_count DESC
"""

MEDIA_CREATED = "SELECT created_at FROM media_file"
TRACK_BY_ID = "SELECT id, path, duration, title FROM media_file WHERE id = ?"
USERS = "SELECT user_name FROM user ORDER BY user_name"
USER_EXACT = "SELECT user_name FROM user WHERE user_name = ?"
USER_NOCASE = "SELECT user_name FROM user WHERE lower(user_name) = lower(?)"
