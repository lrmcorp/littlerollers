// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'user_verification_document_summary.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

const UserVerificationDocumentSummaryKindEnum
_$userVerificationDocumentSummaryKindEnum_SELFIE =
    const UserVerificationDocumentSummaryKindEnum._('SELFIE');
const UserVerificationDocumentSummaryKindEnum
_$userVerificationDocumentSummaryKindEnum_KTP_FRONT =
    const UserVerificationDocumentSummaryKindEnum._('KTP_FRONT');

UserVerificationDocumentSummaryKindEnum
_$userVerificationDocumentSummaryKindEnumValueOf(String name) {
  switch (name) {
    case 'SELFIE':
      return _$userVerificationDocumentSummaryKindEnum_SELFIE;
    case 'KTP_FRONT':
      return _$userVerificationDocumentSummaryKindEnum_KTP_FRONT;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<UserVerificationDocumentSummaryKindEnum>
_$userVerificationDocumentSummaryKindEnumValues =
    BuiltSet<UserVerificationDocumentSummaryKindEnum>(
      const <UserVerificationDocumentSummaryKindEnum>[
        _$userVerificationDocumentSummaryKindEnum_SELFIE,
        _$userVerificationDocumentSummaryKindEnum_KTP_FRONT,
      ],
    );

Serializer<UserVerificationDocumentSummaryKindEnum>
_$userVerificationDocumentSummaryKindEnumSerializer =
    _$UserVerificationDocumentSummaryKindEnumSerializer();

class _$UserVerificationDocumentSummaryKindEnumSerializer
    implements PrimitiveSerializer<UserVerificationDocumentSummaryKindEnum> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'SELFIE': 'SELFIE',
    'KTP_FRONT': 'KTP_FRONT',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'SELFIE': 'SELFIE',
    'KTP_FRONT': 'KTP_FRONT',
  };

  @override
  final Iterable<Type> types = const <Type>[
    UserVerificationDocumentSummaryKindEnum,
  ];
  @override
  final String wireName = 'UserVerificationDocumentSummaryKindEnum';

  @override
  Object serialize(
    Serializers serializers,
    UserVerificationDocumentSummaryKindEnum object, {
    FullType specifiedType = FullType.unspecified,
  }) => _toWire[object.name] ?? object.name;

  @override
  UserVerificationDocumentSummaryKindEnum deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) => UserVerificationDocumentSummaryKindEnum.valueOf(
    _fromWire[serialized] ?? (serialized is String ? serialized : ''),
  );
}

class _$UserVerificationDocumentSummary
    extends UserVerificationDocumentSummary {
  @override
  final UserVerificationDocumentSummaryKindEnum kind;
  @override
  final String status;
  @override
  final String uploadStatus;
  @override
  final String scanStatus;
  @override
  final String? rejectionReasonCode;
  @override
  final DateTime? uploadedAt;
  @override
  final DateTime? reviewedAt;
  @override
  final DateTime updatedAt;

  factory _$UserVerificationDocumentSummary([
    void Function(UserVerificationDocumentSummaryBuilder)? updates,
  ]) => (UserVerificationDocumentSummaryBuilder()..update(updates))._build();

  _$UserVerificationDocumentSummary._({
    required this.kind,
    required this.status,
    required this.uploadStatus,
    required this.scanStatus,
    this.rejectionReasonCode,
    this.uploadedAt,
    this.reviewedAt,
    required this.updatedAt,
  }) : super._();
  @override
  UserVerificationDocumentSummary rebuild(
    void Function(UserVerificationDocumentSummaryBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  UserVerificationDocumentSummaryBuilder toBuilder() =>
      UserVerificationDocumentSummaryBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is UserVerificationDocumentSummary &&
        kind == other.kind &&
        status == other.status &&
        uploadStatus == other.uploadStatus &&
        scanStatus == other.scanStatus &&
        rejectionReasonCode == other.rejectionReasonCode &&
        uploadedAt == other.uploadedAt &&
        reviewedAt == other.reviewedAt &&
        updatedAt == other.updatedAt;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, kind.hashCode);
    _$hash = $jc(_$hash, status.hashCode);
    _$hash = $jc(_$hash, uploadStatus.hashCode);
    _$hash = $jc(_$hash, scanStatus.hashCode);
    _$hash = $jc(_$hash, rejectionReasonCode.hashCode);
    _$hash = $jc(_$hash, uploadedAt.hashCode);
    _$hash = $jc(_$hash, reviewedAt.hashCode);
    _$hash = $jc(_$hash, updatedAt.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'UserVerificationDocumentSummary')
          ..add('kind', kind)
          ..add('status', status)
          ..add('uploadStatus', uploadStatus)
          ..add('scanStatus', scanStatus)
          ..add('rejectionReasonCode', rejectionReasonCode)
          ..add('uploadedAt', uploadedAt)
          ..add('reviewedAt', reviewedAt)
          ..add('updatedAt', updatedAt))
        .toString();
  }
}

class UserVerificationDocumentSummaryBuilder
    implements
        Builder<
          UserVerificationDocumentSummary,
          UserVerificationDocumentSummaryBuilder
        > {
  _$UserVerificationDocumentSummary? _$v;

  UserVerificationDocumentSummaryKindEnum? _kind;
  UserVerificationDocumentSummaryKindEnum? get kind => _$this._kind;
  set kind(UserVerificationDocumentSummaryKindEnum? kind) =>
      _$this._kind = kind;

  String? _status;
  String? get status => _$this._status;
  set status(String? status) => _$this._status = status;

  String? _uploadStatus;
  String? get uploadStatus => _$this._uploadStatus;
  set uploadStatus(String? uploadStatus) => _$this._uploadStatus = uploadStatus;

  String? _scanStatus;
  String? get scanStatus => _$this._scanStatus;
  set scanStatus(String? scanStatus) => _$this._scanStatus = scanStatus;

  String? _rejectionReasonCode;
  String? get rejectionReasonCode => _$this._rejectionReasonCode;
  set rejectionReasonCode(String? rejectionReasonCode) =>
      _$this._rejectionReasonCode = rejectionReasonCode;

  DateTime? _uploadedAt;
  DateTime? get uploadedAt => _$this._uploadedAt;
  set uploadedAt(DateTime? uploadedAt) => _$this._uploadedAt = uploadedAt;

  DateTime? _reviewedAt;
  DateTime? get reviewedAt => _$this._reviewedAt;
  set reviewedAt(DateTime? reviewedAt) => _$this._reviewedAt = reviewedAt;

  DateTime? _updatedAt;
  DateTime? get updatedAt => _$this._updatedAt;
  set updatedAt(DateTime? updatedAt) => _$this._updatedAt = updatedAt;

  UserVerificationDocumentSummaryBuilder() {
    UserVerificationDocumentSummary._defaults(this);
  }

  UserVerificationDocumentSummaryBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _kind = $v.kind;
      _status = $v.status;
      _uploadStatus = $v.uploadStatus;
      _scanStatus = $v.scanStatus;
      _rejectionReasonCode = $v.rejectionReasonCode;
      _uploadedAt = $v.uploadedAt;
      _reviewedAt = $v.reviewedAt;
      _updatedAt = $v.updatedAt;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(UserVerificationDocumentSummary other) {
    _$v = other as _$UserVerificationDocumentSummary;
  }

  @override
  void update(void Function(UserVerificationDocumentSummaryBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  UserVerificationDocumentSummary build() => _build();

  _$UserVerificationDocumentSummary _build() {
    final _$result =
        _$v ??
        _$UserVerificationDocumentSummary._(
          kind: BuiltValueNullFieldError.checkNotNull(
            kind,
            r'UserVerificationDocumentSummary',
            'kind',
          ),
          status: BuiltValueNullFieldError.checkNotNull(
            status,
            r'UserVerificationDocumentSummary',
            'status',
          ),
          uploadStatus: BuiltValueNullFieldError.checkNotNull(
            uploadStatus,
            r'UserVerificationDocumentSummary',
            'uploadStatus',
          ),
          scanStatus: BuiltValueNullFieldError.checkNotNull(
            scanStatus,
            r'UserVerificationDocumentSummary',
            'scanStatus',
          ),
          rejectionReasonCode: rejectionReasonCode,
          uploadedAt: uploadedAt,
          reviewedAt: reviewedAt,
          updatedAt: BuiltValueNullFieldError.checkNotNull(
            updatedAt,
            r'UserVerificationDocumentSummary',
            'updatedAt',
          ),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
