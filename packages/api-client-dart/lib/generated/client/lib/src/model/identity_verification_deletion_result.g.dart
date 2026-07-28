// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'identity_verification_deletion_result.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

const IdentityVerificationDeletionResultStatusEnum
_$identityVerificationDeletionResultStatusEnum_DELETED =
    const IdentityVerificationDeletionResultStatusEnum._('DELETED');
const IdentityVerificationDeletionResultStatusEnum
_$identityVerificationDeletionResultStatusEnum_DELETE_FAILED =
    const IdentityVerificationDeletionResultStatusEnum._('DELETE_FAILED');

IdentityVerificationDeletionResultStatusEnum
_$identityVerificationDeletionResultStatusEnumValueOf(String name) {
  switch (name) {
    case 'DELETED':
      return _$identityVerificationDeletionResultStatusEnum_DELETED;
    case 'DELETE_FAILED':
      return _$identityVerificationDeletionResultStatusEnum_DELETE_FAILED;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<IdentityVerificationDeletionResultStatusEnum>
_$identityVerificationDeletionResultStatusEnumValues =
    BuiltSet<IdentityVerificationDeletionResultStatusEnum>(
      const <IdentityVerificationDeletionResultStatusEnum>[
        _$identityVerificationDeletionResultStatusEnum_DELETED,
        _$identityVerificationDeletionResultStatusEnum_DELETE_FAILED,
      ],
    );

Serializer<IdentityVerificationDeletionResultStatusEnum>
_$identityVerificationDeletionResultStatusEnumSerializer =
    _$IdentityVerificationDeletionResultStatusEnumSerializer();

class _$IdentityVerificationDeletionResultStatusEnumSerializer
    implements
        PrimitiveSerializer<IdentityVerificationDeletionResultStatusEnum> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'DELETED': 'DELETED',
    'DELETE_FAILED': 'DELETE_FAILED',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'DELETED': 'DELETED',
    'DELETE_FAILED': 'DELETE_FAILED',
  };

  @override
  final Iterable<Type> types = const <Type>[
    IdentityVerificationDeletionResultStatusEnum,
  ];
  @override
  final String wireName = 'IdentityVerificationDeletionResultStatusEnum';

  @override
  Object serialize(
    Serializers serializers,
    IdentityVerificationDeletionResultStatusEnum object, {
    FullType specifiedType = FullType.unspecified,
  }) => _toWire[object.name] ?? object.name;

  @override
  IdentityVerificationDeletionResultStatusEnum deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) => IdentityVerificationDeletionResultStatusEnum.valueOf(
    _fromWire[serialized] ?? (serialized is String ? serialized : ''),
  );
}

class _$IdentityVerificationDeletionResult
    extends IdentityVerificationDeletionResult {
  @override
  final String id;
  @override
  final IdentityVerificationDeletionResultStatusEnum status;
  @override
  final int version;
  @override
  final String auditReference;
  @override
  final DateTime? nextAttemptAt;

  factory _$IdentityVerificationDeletionResult([
    void Function(IdentityVerificationDeletionResultBuilder)? updates,
  ]) => (IdentityVerificationDeletionResultBuilder()..update(updates))._build();

  _$IdentityVerificationDeletionResult._({
    required this.id,
    required this.status,
    required this.version,
    required this.auditReference,
    this.nextAttemptAt,
  }) : super._();
  @override
  IdentityVerificationDeletionResult rebuild(
    void Function(IdentityVerificationDeletionResultBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  IdentityVerificationDeletionResultBuilder toBuilder() =>
      IdentityVerificationDeletionResultBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is IdentityVerificationDeletionResult &&
        id == other.id &&
        status == other.status &&
        version == other.version &&
        auditReference == other.auditReference &&
        nextAttemptAt == other.nextAttemptAt;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, id.hashCode);
    _$hash = $jc(_$hash, status.hashCode);
    _$hash = $jc(_$hash, version.hashCode);
    _$hash = $jc(_$hash, auditReference.hashCode);
    _$hash = $jc(_$hash, nextAttemptAt.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'IdentityVerificationDeletionResult')
          ..add('id', id)
          ..add('status', status)
          ..add('version', version)
          ..add('auditReference', auditReference)
          ..add('nextAttemptAt', nextAttemptAt))
        .toString();
  }
}

class IdentityVerificationDeletionResultBuilder
    implements
        Builder<
          IdentityVerificationDeletionResult,
          IdentityVerificationDeletionResultBuilder
        > {
  _$IdentityVerificationDeletionResult? _$v;

  String? _id;
  String? get id => _$this._id;
  set id(String? id) => _$this._id = id;

  IdentityVerificationDeletionResultStatusEnum? _status;
  IdentityVerificationDeletionResultStatusEnum? get status => _$this._status;
  set status(IdentityVerificationDeletionResultStatusEnum? status) =>
      _$this._status = status;

  int? _version;
  int? get version => _$this._version;
  set version(int? version) => _$this._version = version;

  String? _auditReference;
  String? get auditReference => _$this._auditReference;
  set auditReference(String? auditReference) =>
      _$this._auditReference = auditReference;

  DateTime? _nextAttemptAt;
  DateTime? get nextAttemptAt => _$this._nextAttemptAt;
  set nextAttemptAt(DateTime? nextAttemptAt) =>
      _$this._nextAttemptAt = nextAttemptAt;

  IdentityVerificationDeletionResultBuilder() {
    IdentityVerificationDeletionResult._defaults(this);
  }

  IdentityVerificationDeletionResultBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _id = $v.id;
      _status = $v.status;
      _version = $v.version;
      _auditReference = $v.auditReference;
      _nextAttemptAt = $v.nextAttemptAt;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(IdentityVerificationDeletionResult other) {
    _$v = other as _$IdentityVerificationDeletionResult;
  }

  @override
  void update(
    void Function(IdentityVerificationDeletionResultBuilder)? updates,
  ) {
    if (updates != null) updates(this);
  }

  @override
  IdentityVerificationDeletionResult build() => _build();

  _$IdentityVerificationDeletionResult _build() {
    final _$result =
        _$v ??
        _$IdentityVerificationDeletionResult._(
          id: BuiltValueNullFieldError.checkNotNull(
            id,
            r'IdentityVerificationDeletionResult',
            'id',
          ),
          status: BuiltValueNullFieldError.checkNotNull(
            status,
            r'IdentityVerificationDeletionResult',
            'status',
          ),
          version: BuiltValueNullFieldError.checkNotNull(
            version,
            r'IdentityVerificationDeletionResult',
            'version',
          ),
          auditReference: BuiltValueNullFieldError.checkNotNull(
            auditReference,
            r'IdentityVerificationDeletionResult',
            'auditReference',
          ),
          nextAttemptAt: nextAttemptAt,
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
