CREATE OR REPLACE FUNCTION increment_creator_likes(creator_id_in uuid, amount int)
RETURNS void AS $$
BEGIN
  UPDATE creators
  SET total_likes = total_likes + amount
  WHERE id = creator_id_in;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION decrement_creator_likes(creator_id_in uuid, amount int)
RETURNS void AS $$
BEGIN
  UPDATE creators
  SET total_likes = total_likes - amount
  WHERE id = creator_id_in;
END;
$$ LANGUAGE plpgsql;
