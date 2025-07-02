-- Create the function get_all_commissions
CREATE
OR REPLACE FUNCTION get_all_commissions () RETURNS TABLE (
  id uuid,
  status text,
  public_note text,
  secure_note text,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  latest_payment json,
  customer json,
  n_characters bigint
) LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.status,
    c.public_note,
    c.secure_note,
    c.created_at,
    c.updated_at,
    (SELECT json_build_object(
      'created_at', cp.created_at,
      'currency', cp.currency,
      'income_amount', cp.income_amount,
      'state', cp.state,
      'public_note', cp.public_note,
      'secure_note', cp.secure_note,
      'payment_ext_id', cp.payment_ext_id,
      'payment_ext_url', cp.payment_ext_url,
      'payment_processor', cp.payment_processor
    ) FROM commissions_payments cp WHERE cp.commission = c.id ORDER BY cp.created_at DESC LIMIT 1) AS latest_payment,
    (SELECT json_build_object(
      'id', cu.id,
      'name', cu.name,
      'vrc_id', cu.vrc_id
    ) FROM customers cu WHERE cu.id = c.customer) AS customer,
    (SELECT COUNT(*) FROM commissions_characters cc WHERE cc.commission = c.id) AS n_characters
  FROM 
    commissions c;
END;
$$;

-- Create the function update_order_id
CREATE
OR REPLACE FUNCTION update_order_id () RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.order_id := SUBSTRING(NEW.commission::text FROM 1 FOR 4) || '-' || NEW.id::text;
  RETURN NEW;
END;
$$;

-- Create the trigger set_commchar_order_id
CREATE TRIGGER set_commchar_order_id BEFORE INSERT
OR
UPDATE ON commissions_characters FOR EACH ROW
EXECUTE FUNCTION update_order_id ();