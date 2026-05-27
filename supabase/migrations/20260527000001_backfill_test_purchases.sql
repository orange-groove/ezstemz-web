-- Backfill paid test Checkout sessions that completed before the webhook was wired.
insert into public.purchases (
  user_id,
  stripe_customer_id,
  stripe_session_id,
  stripe_payment_intent_id,
  amount_total,
  currency,
  status
)
values
  (
    'a72424f1-1f46-4bda-9de6-a9296a138005',
    'cus_UapidWLOu4h3Xs',
    'cs_test_b1YvLkMNz2kqhTvElc3y09kQQPCfCXUlYOXYK8IwPbyS9jKn5Ird4Bk37M',
    'pi_3Tbe3YP5znU1TAbS1JklTmT9',
    2000,
    'usd',
    'paid'
  ),
  (
    'a72424f1-1f46-4bda-9de6-a9296a138005',
    'cus_Uapcdcgb6DWJP4',
    'cs_test_b1eDigbgaCewYUeDkd2dhf2IFjFkc9uABm0069BJMbZal9jzv4Qnm5QCAp',
    'pi_3Tbdy9P5znU1TAbS0kYIH9yp',
    2000,
    'usd',
    'paid'
  )
on conflict (stripe_session_id) do nothing;
