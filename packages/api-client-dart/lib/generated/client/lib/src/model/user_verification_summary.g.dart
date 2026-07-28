// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'user_verification_summary.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

const UserVerificationSummaryStatusEnum
_$userVerificationSummaryStatusEnum_PENDING =
    const UserVerificationSummaryStatusEnum._('PENDING');
const UserVerificationSummaryStatusEnum
_$userVerificationSummaryStatusEnum_ACTION_REQUIRED =
    const UserVerificationSummaryStatusEnum._('ACTION_REQUIRED');
const UserVerificationSummaryStatusEnum
_$userVerificationSummaryStatusEnum_APPROVED =
    const UserVerificationSummaryStatusEnum._('APPROVED');

UserVerificationSummaryStatusEnum _$userVerificationSummaryStatusEnumValueOf(
  String name,
) {
  switch (name) {
    case 'PENDING':
      return _$userVerificationSummaryStatusEnum_PENDING;
    case 'ACTION_REQUIRED':
      return _$userVerificationSummaryStatusEnum_ACTION_REQUIRED;
    case 'APPROVED':
      return _$userVerificationSummaryStatusEnum_APPROVED;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<UserVerificationSummaryStatusEnum>
_$userVerificationSummaryStatusEnumValues =
    BuiltSet<UserVerificationSummaryStatusEnum>(
      const <UserVerificationSummaryStatusEnum>[
        _$userVerificationSummaryStatusEnum_PENDING,
        _$userVerificationSummaryStatusEnum_ACTION_REQUIRED,
        _$userVerificationSummaryStatusEnum_APPROVED,
      ],
    );

Serializer<UserVerificationSummaryStatusEnum>
_$userVerificationSummaryStatusEnumSerializer =
    _$UserVerificationSummaryStatusEnumSerializer();

class _$UserVerificationSummaryStatusEnumSerializer
    implements PrimitiveSerializer<UserVerificationSummaryStatusEnum> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'PENDING': 'PENDING',
    'ACTION_REQUIRED': 'ACTION_REQUIRED',
    'APPROVED': 'APPROVED',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'PENDING': 'PENDING',
    'ACTION_REQUIRED': 'ACTION_REQUIRED',
    'APPROVED': 'APPROVED',
  };

  @override
  final Iterable<Type> types = const <Type>[UserVerificationSummaryStatusEnum];
  @override
  final String wireName = 'UserVerificationSummaryStatusEnum';

  @override
  Object serialize(
    Serializers serializers,
    UserVerificationSummaryStatusEnum object, {
    FullType specifiedType = FullType.unspecified,
  }) => _toWire[object.name] ?? object.name;

  @override
  UserVerificationSummaryStatusEnum deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) => UserVerificationSummaryStatusEnum.valueOf(
    _fromWire[serialized] ?? (serialized is String ? serialized : ''),
  );
}

class _$UserVerificationSummary extends UserVerificationSummary {
  @override
  final UserVerificationSummaryStatusEnum status;
  @override
  final BuiltList<UserVerificationDocumentSummary> documents;

  factory _$UserVerificationSummary([
    void Function(UserVerificationSummaryBuilder)? updates,
  ]) => (UserVerificationSummaryBuilder()..update(updates))._build();

  _$UserVerificationSummary._({required this.status, required this.documents})
    : super._();
  @override
  UserVerificationSummary rebuild(
    void Function(UserVerificationSummaryBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  UserVerificationSummaryBuilder toBuilder() =>
      UserVerificationSummaryBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is UserVerificationSummary &&
        status == other.status &&
        documents == other.documents;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, status.hashCode);
    _$hash = $jc(_$hash, documents.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'UserVerificationSummary')
          ..add('status', status)
          ..add('documents', documents))
        .toString();
  }
}

class UserVerificationSummaryBuilder
    implements
        Builder<UserVerificationSummary, UserVerificationSummaryBuilder> {
  _$UserVerificationSummary? _$v;

  UserVerificationSummaryStatusEnum? _status;
  UserVerificationSummaryStatusEnum? get status => _$this._status;
  set status(UserVerificationSummaryStatusEnum? status) =>
      _$this._status = status;

  ListBuilder<UserVerificationDocumentSummary>? _documents;
  ListBuilder<UserVerificationDocumentSummary> get documents =>
      _$this._documents ??= ListBuilder<UserVerificationDocumentSummary>();
  set documents(ListBuilder<UserVerificationDocumentSummary>? documents) =>
      _$this._documents = documents;

  UserVerificationSummaryBuilder() {
    UserVerificationSummary._defaults(this);
  }

  UserVerificationSummaryBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _status = $v.status;
      _documents = $v.documents.toBuilder();
      _$v = null;
    }
    return this;
  }

  @override
  void replace(UserVerificationSummary other) {
    _$v = other as _$UserVerificationSummary;
  }

  @override
  void update(void Function(UserVerificationSummaryBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  UserVerificationSummary build() => _build();

  _$UserVerificationSummary _build() {
    _$UserVerificationSummary _$result;
    try {
      _$result =
          _$v ??
          _$UserVerificationSummary._(
            status: BuiltValueNullFieldError.checkNotNull(
              status,
              r'UserVerificationSummary',
              'status',
            ),
            documents: documents.build(),
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'documents';
        documents.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
          r'UserVerificationSummary',
          _$failedField,
          e.toString(),
        );
      }
      rethrow;
    }
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
