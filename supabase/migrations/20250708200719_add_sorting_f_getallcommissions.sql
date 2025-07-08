DROP FUNCTION IF EXISTS get_all_commissions();
DROP FUNCTION IF EXISTS get_all_commissions(text, integer, jsonb);
CREATE OR REPLACE FUNCTION get_all_commissions(
    sort_by text DEFAULT 'created_at',
    page_number integer DEFAULT 1,
    filter jsonb DEFAULT '{}'::jsonb
)
RETURNS TABLE (
    id uuid,
    status text,
    public_note text,
    secure_note text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    latest_payment json,
    customer json,
    n_characters bigint
) AS $$
DECLARE
    items_per_page constant integer := 50;
    offset_value integer;
    filter_state text;
    filter_customer_id text;
    filter_id text;
    filter_currency text;
BEGIN
    -- Validate sort parameter
    IF sort_by != 'created_at' AND sort_by != 'updated_at' THEN
        RAISE EXCEPTION 'Invalid sort parameter. Must be either ''created_at'' or ''updated_at''';
    END IF;
    
    -- Extract filter values
    filter_state := filter->>'state';
    filter_customer_id := filter->>'customer_id';
    filter_id := filter->>'id';
    filter_currency := filter->>'currency';
    
    -- Calculate offset for pagination
    offset_value := (page_number - 1) * items_per_page;
    
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
        commissions c
    WHERE
        -- Apply filters only if they are provided
        (filter_state IS NULL OR c.status = filter_state) AND
        (filter_customer_id IS NULL OR c.customer::text = filter_customer_id) AND
        (filter_id IS NULL OR c.id::text = filter_id) AND
        (filter_currency IS NULL OR EXISTS (
            SELECT 1 FROM commissions_payments cp 
            WHERE cp.commission = c.id AND cp.currency = filter_currency
        ))
    ORDER BY
        CASE WHEN sort_by = 'created_at' THEN c.created_at ELSE c.updated_at END DESC
    LIMIT items_per_page
    OFFSET offset_value;
END;
$$ LANGUAGE plpgsql;