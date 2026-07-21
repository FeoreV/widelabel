-- Migration 002: Waitlist and Notification Delivery
-- Depends on: 001_extensions_enums_drops_reservations.sql (waitlist_channel, waitlist_status ENUMs)

CREATE TABLE wide_label_waitlist_entry (
  id                         uuid              PRIMARY KEY DEFAULT gen_random_uuid(),
  variant_id                 varchar(64)       NOT NULL,
  email                      varchar(320),
  telegram_chat_id           varchar(64),
  channel                    waitlist_channel  NOT NULL,
  normalized_contact         varchar(320)      NOT NULL,
  status                     waitlist_status   NOT NULL DEFAULT 'active',
  consent_version            varchar(32)       NOT NULL,
  confirmed_at               timestamptz,
  notified_at                timestamptz,
  last_notification_event_id uuid,
  created_at                 timestamptz       NOT NULL DEFAULT now(),
  updated_at                 timestamptz       NOT NULL DEFAULT now(),
  CHECK (email IS NOT NULL OR telegram_chat_id IS NOT NULL)
);

-- Deduplication: one active subscription per variant + normalized_contact
CREATE UNIQUE INDEX uq_wl_waitlist_active_contact
  ON wide_label_waitlist_entry (variant_id, normalized_contact)
  WHERE status = 'active';

-- Notification delivery tracking
CREATE TABLE wide_label_notification_delivery (
  id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id            uuid        NOT NULL,
  waitlist_entry_id   uuid        NOT NULL REFERENCES wide_label_waitlist_entry(id),
  channel             varchar(16) NOT NULL CHECK (channel IN ('email', 'telegram')),
  status              varchar(16) NOT NULL CHECK (status IN ('queued', 'sent', 'failed', 'skipped')),
  provider_message_id varchar(255),
  attempts            integer     NOT NULL DEFAULT 0,
  sent_at             timestamptz,
  last_error          text,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now(),
  UNIQUE (event_id, waitlist_entry_id, channel)
);
