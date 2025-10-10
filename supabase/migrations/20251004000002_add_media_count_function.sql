CREATE OR REPLACE FUNCTION increment_creator_media_count(creator_id_in uuid, amount int)
RETURNS void AS $$
BEGIN
  UPDATE creators
  SET media_count = media_count + amount
  WHERE id = creator_id_in;
END;
$$ LANGUAGE plpgsql;
