// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'customer_check_in_issue.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

const CustomerCheckInIssueStatusEnum _$customerCheckInIssueStatusEnum_ACTIVE =
    const CustomerCheckInIssueStatusEnum._('ACTIVE');
const CustomerCheckInIssueStatusEnum _$customerCheckInIssueStatusEnum_USED =
    const CustomerCheckInIssueStatusEnum._('USED');
const CustomerCheckInIssueStatusEnum _$customerCheckInIssueStatusEnum_REVOKED =
    const CustomerCheckInIssueStatusEnum._('REVOKED');

CustomerCheckInIssueStatusEnum _$customerCheckInIssueStatusEnumValueOf(
  String name,
) {
  switch (name) {
    case 'ACTIVE':
      return _$customerCheckInIssueStatusEnum_ACTIVE;
    case 'USED':
      return _$customerCheckInIssueStatusEnum_USED;
    case 'REVOKED':
      return _$customerCheckInIssueStatusEnum_REVOKED;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<CustomerCheckInIssueStatusEnum>
_$customerCheckInIssueStatusEnumValues =
    BuiltSet<CustomerCheckInIssueStatusEnum>(
      const <CustomerCheckInIssueStatusEnum>[
        _$customerCheckInIssueStatusEnum_ACTIVE,
        _$customerCheckInIssueStatusEnum_USED,
        _$customerCheckInIssueStatusEnum_REVOKED,
      ],
    );

Serializer<CustomerCheckInIssueStatusEnum>
_$customerCheckInIssueStatusEnumSerializer =
    _$CustomerCheckInIssueStatusEnumSerializer();

class _$CustomerCheckInIssueStatusEnumSerializer
    implements PrimitiveSerializer<CustomerCheckInIssueStatusEnum> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'ACTIVE': 'ACTIVE',
    'USED': 'USED',
    'REVOKED': 'REVOKED',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'ACTIVE': 'ACTIVE',
    'USED': 'USED',
    'REVOKED': 'REVOKED',
  };

  @override
  final Iterable<Type> types = const <Type>[CustomerCheckInIssueStatusEnum];
  @override
  final String wireName = 'CustomerCheckInIssueStatusEnum';

  @override
  Object serialize(
    Serializers serializers,
    CustomerCheckInIssueStatusEnum object, {
    FullType specifiedType = FullType.unspecified,
  }) => _toWire[object.name] ?? object.name;

  @override
  CustomerCheckInIssueStatusEnum deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) => CustomerCheckInIssueStatusEnum.valueOf(
    _fromWire[serialized] ?? (serialized is String ? serialized : ''),
  );
}

class _$CustomerCheckInIssue extends CustomerCheckInIssue {
  @override
  final String id;
  @override
  final JsonObject? purpose;
  @override
  final String bookingId;
  @override
  final DateTime notBeforeAt;
  @override
  final DateTime expiresAt;
  @override
  final CustomerCheckInIssueStatusEnum status;
  @override
  final int version;
  @override
  final String? token;
  @override
  final String? qrPayload;
  @override
  final String? passUrl;
  @override
  final String? maskedCustomerPhone;
  @override
  final String? whatsappUrl;
  @override
  final String? message;
  @override
  final bool idempotentReplay;

  factory _$CustomerCheckInIssue([
    void Function(CustomerCheckInIssueBuilder)? updates,
  ]) => (CustomerCheckInIssueBuilder()..update(updates))._build();

  _$CustomerCheckInIssue._({
    required this.id,
    this.purpose,
    required this.bookingId,
    required this.notBeforeAt,
    required this.expiresAt,
    required this.status,
    required this.version,
    this.token,
    this.qrPayload,
    this.passUrl,
    this.maskedCustomerPhone,
    this.whatsappUrl,
    this.message,
    required this.idempotentReplay,
  }) : super._();
  @override
  CustomerCheckInIssue rebuild(
    void Function(CustomerCheckInIssueBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  CustomerCheckInIssueBuilder toBuilder() =>
      CustomerCheckInIssueBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is CustomerCheckInIssue &&
        id == other.id &&
        purpose == other.purpose &&
        bookingId == other.bookingId &&
        notBeforeAt == other.notBeforeAt &&
        expiresAt == other.expiresAt &&
        status == other.status &&
        version == other.version &&
        token == other.token &&
        qrPayload == other.qrPayload &&
        passUrl == other.passUrl &&
        maskedCustomerPhone == other.maskedCustomerPhone &&
        whatsappUrl == other.whatsappUrl &&
        message == other.message &&
        idempotentReplay == other.idempotentReplay;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, id.hashCode);
    _$hash = $jc(_$hash, purpose.hashCode);
    _$hash = $jc(_$hash, bookingId.hashCode);
    _$hash = $jc(_$hash, notBeforeAt.hashCode);
    _$hash = $jc(_$hash, expiresAt.hashCode);
    _$hash = $jc(_$hash, status.hashCode);
    _$hash = $jc(_$hash, version.hashCode);
    _$hash = $jc(_$hash, token.hashCode);
    _$hash = $jc(_$hash, qrPayload.hashCode);
    _$hash = $jc(_$hash, passUrl.hashCode);
    _$hash = $jc(_$hash, maskedCustomerPhone.hashCode);
    _$hash = $jc(_$hash, whatsappUrl.hashCode);
    _$hash = $jc(_$hash, message.hashCode);
    _$hash = $jc(_$hash, idempotentReplay.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'CustomerCheckInIssue')
          ..add('id', id)
          ..add('purpose', purpose)
          ..add('bookingId', bookingId)
          ..add('notBeforeAt', notBeforeAt)
          ..add('expiresAt', expiresAt)
          ..add('status', status)
          ..add('version', version)
          ..add('token', token)
          ..add('qrPayload', qrPayload)
          ..add('passUrl', passUrl)
          ..add('maskedCustomerPhone', maskedCustomerPhone)
          ..add('whatsappUrl', whatsappUrl)
          ..add('message', message)
          ..add('idempotentReplay', idempotentReplay))
        .toString();
  }
}

class CustomerCheckInIssueBuilder
    implements Builder<CustomerCheckInIssue, CustomerCheckInIssueBuilder> {
  _$CustomerCheckInIssue? _$v;

  String? _id;
  String? get id => _$this._id;
  set id(String? id) => _$this._id = id;

  JsonObject? _purpose;
  JsonObject? get purpose => _$this._purpose;
  set purpose(JsonObject? purpose) => _$this._purpose = purpose;

  String? _bookingId;
  String? get bookingId => _$this._bookingId;
  set bookingId(String? bookingId) => _$this._bookingId = bookingId;

  DateTime? _notBeforeAt;
  DateTime? get notBeforeAt => _$this._notBeforeAt;
  set notBeforeAt(DateTime? notBeforeAt) => _$this._notBeforeAt = notBeforeAt;

  DateTime? _expiresAt;
  DateTime? get expiresAt => _$this._expiresAt;
  set expiresAt(DateTime? expiresAt) => _$this._expiresAt = expiresAt;

  CustomerCheckInIssueStatusEnum? _status;
  CustomerCheckInIssueStatusEnum? get status => _$this._status;
  set status(CustomerCheckInIssueStatusEnum? status) => _$this._status = status;

  int? _version;
  int? get version => _$this._version;
  set version(int? version) => _$this._version = version;

  String? _token;
  String? get token => _$this._token;
  set token(String? token) => _$this._token = token;

  String? _qrPayload;
  String? get qrPayload => _$this._qrPayload;
  set qrPayload(String? qrPayload) => _$this._qrPayload = qrPayload;

  String? _passUrl;
  String? get passUrl => _$this._passUrl;
  set passUrl(String? passUrl) => _$this._passUrl = passUrl;

  String? _maskedCustomerPhone;
  String? get maskedCustomerPhone => _$this._maskedCustomerPhone;
  set maskedCustomerPhone(String? maskedCustomerPhone) =>
      _$this._maskedCustomerPhone = maskedCustomerPhone;

  String? _whatsappUrl;
  String? get whatsappUrl => _$this._whatsappUrl;
  set whatsappUrl(String? whatsappUrl) => _$this._whatsappUrl = whatsappUrl;

  String? _message;
  String? get message => _$this._message;
  set message(String? message) => _$this._message = message;

  bool? _idempotentReplay;
  bool? get idempotentReplay => _$this._idempotentReplay;
  set idempotentReplay(bool? idempotentReplay) =>
      _$this._idempotentReplay = idempotentReplay;

  CustomerCheckInIssueBuilder() {
    CustomerCheckInIssue._defaults(this);
  }

  CustomerCheckInIssueBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _id = $v.id;
      _purpose = $v.purpose;
      _bookingId = $v.bookingId;
      _notBeforeAt = $v.notBeforeAt;
      _expiresAt = $v.expiresAt;
      _status = $v.status;
      _version = $v.version;
      _token = $v.token;
      _qrPayload = $v.qrPayload;
      _passUrl = $v.passUrl;
      _maskedCustomerPhone = $v.maskedCustomerPhone;
      _whatsappUrl = $v.whatsappUrl;
      _message = $v.message;
      _idempotentReplay = $v.idempotentReplay;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(CustomerCheckInIssue other) {
    _$v = other as _$CustomerCheckInIssue;
  }

  @override
  void update(void Function(CustomerCheckInIssueBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  CustomerCheckInIssue build() => _build();

  _$CustomerCheckInIssue _build() {
    final _$result =
        _$v ??
        _$CustomerCheckInIssue._(
          id: BuiltValueNullFieldError.checkNotNull(
            id,
            r'CustomerCheckInIssue',
            'id',
          ),
          purpose: purpose,
          bookingId: BuiltValueNullFieldError.checkNotNull(
            bookingId,
            r'CustomerCheckInIssue',
            'bookingId',
          ),
          notBeforeAt: BuiltValueNullFieldError.checkNotNull(
            notBeforeAt,
            r'CustomerCheckInIssue',
            'notBeforeAt',
          ),
          expiresAt: BuiltValueNullFieldError.checkNotNull(
            expiresAt,
            r'CustomerCheckInIssue',
            'expiresAt',
          ),
          status: BuiltValueNullFieldError.checkNotNull(
            status,
            r'CustomerCheckInIssue',
            'status',
          ),
          version: BuiltValueNullFieldError.checkNotNull(
            version,
            r'CustomerCheckInIssue',
            'version',
          ),
          token: token,
          qrPayload: qrPayload,
          passUrl: passUrl,
          maskedCustomerPhone: maskedCustomerPhone,
          whatsappUrl: whatsappUrl,
          message: message,
          idempotentReplay: BuiltValueNullFieldError.checkNotNull(
            idempotentReplay,
            r'CustomerCheckInIssue',
            'idempotentReplay',
          ),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
