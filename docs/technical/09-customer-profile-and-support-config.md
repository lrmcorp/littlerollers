# Customer profile and support configuration

Customer studio preference is stored in `User.preferredBranchId`. It is independent from the internal workspace's active branch context. Only active public branches may be selected; an inactive or removed branch is returned as no preference so the customer must choose again.

Support WhatsApp numbers use E.164 format. Configure the central fallback with `PUBLIC_SUPPORT_WHATSAPP_E164`; branch-specific numbers are stored in `Branch.supportWhatsappE164`. The public site-config endpoint exposes only active branch display data and these support numbers. It never exposes identity-document metadata or internal branch configuration.

Non-production seed data supplies deterministic Jakarta and BSD support numbers. Production values must be managed as environment/master-data configuration and must not be copied from demo credentials or seed logs.
