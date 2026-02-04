-- Pridať nový status 'pending' do booking_status enum
ALTER TYPE booking_status ADD VALUE IF NOT EXISTS 'pending';