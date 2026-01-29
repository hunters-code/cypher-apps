# Cypher Wallet Documentation

## Available Documentation

### Deterministic Key Generation

Comprehensive documentation about the deterministic key generation system:

- **[English Documentation](./DETERMINISTIC_KEYS_EN.md)** - Complete guide in English
- **[Dokumentasi Bahasa Indonesia](./DETERMINISTIC_KEYS_ID.md)** - Panduan lengkap dalam Bahasa Indonesia

### Topics Covered

Both documents cover:

1. **Overview** - Introduction and key features
2. **Architecture** - System design and component diagrams
3. **Key Generation** - Deterministic derivation algorithm
4. **Username Registration** - Blockchain-only registration
5. **Recovery Flow** - Key recovery process
6. **Security Model** - Two-factor authentication and security properties
7. **Implementation Details** - File structure and key functions
8. **API Reference** - Complete API documentation
9. **Migration Guide** - Step-by-step migration instructions
10. **Best Practices** - Security and development guidelines
11. **FAQ** - Frequently asked questions

### Quick Links

- [English: Overview](./DETERMINISTIC_KEYS_EN.md#overview)
- [English: Architecture](./DETERMINISTIC_KEYS_EN.md#architecture)
- [English: API Reference](./DETERMINISTIC_KEYS_EN.md#api-reference)
- [Indonesia: Gambaran Umum](./DETERMINISTIC_KEYS_ID.md#gambaran-umum)
- [Indonesia: Arsitektur](./DETERMINISTIC_KEYS_ID.md#arsitektur)
- [Indonesia: Referensi API](./DETERMINISTIC_KEYS_ID.md#referensi-api)

---

## Key Concepts

### Deterministic Keys

Keys are derived from:

- Wallet signature (one-time)
- User PIN (6 digits)
- Domain separation (viewing vs spending)

### Two-Factor Security

Requires both:

- Wallet ownership (signature)
- User PIN

### Blockchain-Only Storage

- Username registration on blockchain
- No database needed for keys
- Keys recoverable from wallet + PIN

---

## Getting Started

1. Read the [Overview](./DETERMINISTIC_KEYS_EN.md#overview) section
2. Understand the [Architecture](./DETERMINISTIC_KEYS_EN.md#architecture)
3. Review [Implementation Details](./DETERMINISTIC_KEYS_EN.md#implementation-details)
4. Follow [Best Practices](./DETERMINISTIC_KEYS_EN.md#best-practices)

---

## Support

For questions or issues:

- Open an issue on GitHub
- Contact the Cypher Wallet team
- Check the [FAQ](./DETERMINISTIC_KEYS_EN.md#faq) section
