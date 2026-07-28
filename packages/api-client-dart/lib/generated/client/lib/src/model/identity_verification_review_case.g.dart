// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'identity_verification_review_case.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

const IdentityVerificationReviewCaseVerificationStatusEnum
_$identityVerificationReviewCaseVerificationStatusEnum_PENDING =
    const IdentityVerificationReviewCaseVerificationStatusEnum._('PENDING');
const IdentityVerificationReviewCaseVerificationStatusEnum
_$identityVerificationReviewCaseVerificationStatusEnum_ACTION_REQUIRED =
    const IdentityVerificationReviewCaseVerificationStatusEnum._(
      'ACTION_REQUIRED',
    );
const IdentityVerificationReviewCaseVerificationStatusEnum
_$identityVerificationReviewCaseVerificationStatusEnum_APPROVED =
    const IdentityVerificationReviewCaseVerificationStatusEnum._('APPROVED');

IdentityVerificationReviewCaseVerificationStatusEnum
_$identityVerificationReviewCaseVerificationStatusEnumValueOf(String name) {
  switch (name) {
    case 'PENDING':
      return _$identityVerificationReviewCaseVerificationStatusEnum_PENDING;
    case 'ACTION_REQUIRED':
      return _$identityVerificationReviewCaseVerificationStatusEnum_ACTION_REQUIRED;
    case 'APPROVED':
      return _$identityVerificationReviewCaseVerificationStatusEnum_APPROVED;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<IdentityVerificationReviewCaseVerificationStatusEnum>
_$identityVerificationReviewCaseVerificationStatusEnumValues =
    BuiltSet<IdentityVerificationReviewCaseVerificationStatusEnum>(
      const <IdentityVerificationReviewCaseVerificationStatusEnum>[
        _$identityVerificationReviewCaseVerificationStatusEnum_PENDING,
        _$identityVerificationReviewCaseVerificationStatusEnum_ACTION_REQUIRED,
        _$identityVerificationReviewCaseVerificationStatusEnum_APPROVED,
      ],
    );

Serializer<IdentityVerificationReviewCaseVerificationStatusEnum>
_$identityVerificationReviewCaseVerificationStatusEnumSerializer =
    _$IdentityVerificationReviewCaseVerificationStatusEnumSerializer();

class _$IdentityVerificationReviewCaseVerificationStatusEnumSerializer
    implements
        PrimitiveSerializer<
          IdentityVerificationReviewCaseVerificationStatusEnum
        > {
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
  final Iterable<Type> types = const <Type>[
    IdentityVerificationReviewCaseVerificationStatusEnum,
  ];
  @override
  final String wireName =
      'IdentityVerificationReviewCaseVerificationStatusEnum';

  @override
  Object serialize(
    Serializers serializers,
    IdentityVerificationReviewCaseVerificationStatusEnum object, {
    FullType specifiedType = FullType.unspecified,
  }) => _toWire[object.name] ?? object.name;

  @override
  IdentityVerificationReviewCaseVerificationStatusEnum deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) => IdentityVerificationReviewCaseVerificationStatusEnum.valueOf(
    _fromWire[serialized] ?? (serialized is String ? serialized : ''),
  );
}

class _$IdentityVerificationReviewCase extends IdentityVerificationReviewCase {
  @override
  final String id;
  @override
  final IdentityVerificationReviewUser user;
  @override
  final IdentityVerificationReviewCaseVerificationStatusEnum verificationStatus;
  @override
  final DateTime? oldestAt;
  @override
  final BuiltList<IdentityVerificationDocument> documents;

  factory _$IdentityVerificationReviewCase([
    void Function(IdentityVerificationReviewCaseBuilder)? updates,
  ]) => (IdentityVerificationReviewCaseBuilder()..update(updates))._build();

  _$IdentityVerificationReviewCase._({
    required this.id,
    required this.user,
    required this.verificationStatus,
    this.oldestAt,
    required this.documents,
  }) : super._();
  @override
  IdentityVerificationReviewCase rebuild(
    void Function(IdentityVerificationReviewCaseBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  IdentityVerificationReviewCaseBuilder toBuilder() =>
      IdentityVerificationReviewCaseBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is IdentityVerificationReviewCase &&
        id == other.id &&
        user == other.user &&
        verificationStatus == other.verificationStatus &&
        oldestAt == other.oldestAt &&
        documents == other.documents;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, id.hashCode);
    _$hash = $jc(_$hash, user.hashCode);
    _$hash = $jc(_$hash, verificationStatus.hashCode);
    _$hash = $jc(_$hash, oldestAt.hashCode);
    _$hash = $jc(_$hash, documents.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'IdentityVerificationReviewCase')
          ..add('id', id)
          ..add('user', user)
          ..add('verificationStatus', verificationStatus)
          ..add('oldestAt', oldestAt)
          ..add('documents', documents))
        .toString();
  }
}

class IdentityVerificationReviewCaseBuilder
    implements
        Builder<
          IdentityVerificationReviewCase,
          IdentityVerificationReviewCaseBuilder
        > {
  _$IdentityVerificationReviewCase? _$v;

  String? _id;
  String? get id => _$this._id;
  set id(String? id) => _$this._id = id;

  IdentityVerificationReviewUserBuilder? _user;
  IdentityVerificationReviewUserBuilder get user =>
      _$this._user ??= IdentityVerificationReviewUserBuilder();
  set user(IdentityVerificationReviewUserBuilder? user) => _$this._user = user;

  IdentityVerificationReviewCaseVerificationStatusEnum? _verificationStatus;
  IdentityVerificationReviewCaseVerificationStatusEnum?
  get verificationStatus => _$this._verificationStatus;
  set verificationStatus(
    IdentityVerificationReviewCaseVerificationStatusEnum? verificationStatus,
  ) => _$this._verificationStatus = verificationStatus;

  DateTime? _oldestAt;
  DateTime? get oldestAt => _$this._oldestAt;
  set oldestAt(DateTime? oldestAt) => _$this._oldestAt = oldestAt;

  ListBuilder<IdentityVerificationDocument>? _documents;
  ListBuilder<IdentityVerificationDocument> get documents =>
      _$this._documents ??= ListBuilder<IdentityVerificationDocument>();
  set documents(ListBuilder<IdentityVerificationDocument>? documents) =>
      _$this._documents = documents;

  IdentityVerificationReviewCaseBuilder() {
    IdentityVerificationReviewCase._defaults(this);
  }

  IdentityVerificationReviewCaseBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _id = $v.id;
      _user = $v.user.toBuilder();
      _verificationStatus = $v.verificationStatus;
      _oldestAt = $v.oldestAt;
      _documents = $v.documents.toBuilder();
      _$v = null;
    }
    return this;
  }

  @override
  void replace(IdentityVerificationReviewCase other) {
    _$v = other as _$IdentityVerificationReviewCase;
  }

  @override
  void update(void Function(IdentityVerificationReviewCaseBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  IdentityVerificationReviewCase build() => _build();

  _$IdentityVerificationReviewCase _build() {
    _$IdentityVerificationReviewCase _$result;
    try {
      _$result =
          _$v ??
          _$IdentityVerificationReviewCase._(
            id: BuiltValueNullFieldError.checkNotNull(
              id,
              r'IdentityVerificationReviewCase',
              'id',
            ),
            user: user.build(),
            verificationStatus: BuiltValueNullFieldError.checkNotNull(
              verificationStatus,
              r'IdentityVerificationReviewCase',
              'verificationStatus',
            ),
            oldestAt: oldestAt,
            documents: documents.build(),
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'user';
        user.build();

        _$failedField = 'documents';
        documents.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
          r'IdentityVerificationReviewCase',
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
