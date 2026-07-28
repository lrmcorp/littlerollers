// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'identity_verification_review_user.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

const IdentityVerificationReviewUserStatusEnum
_$identityVerificationReviewUserStatusEnum_PENDING_ACTIVATION =
    const IdentityVerificationReviewUserStatusEnum._('PENDING_ACTIVATION');
const IdentityVerificationReviewUserStatusEnum
_$identityVerificationReviewUserStatusEnum_ACTIVE =
    const IdentityVerificationReviewUserStatusEnum._('ACTIVE');
const IdentityVerificationReviewUserStatusEnum
_$identityVerificationReviewUserStatusEnum_INACTIVE =
    const IdentityVerificationReviewUserStatusEnum._('INACTIVE');

IdentityVerificationReviewUserStatusEnum
_$identityVerificationReviewUserStatusEnumValueOf(String name) {
  switch (name) {
    case 'PENDING_ACTIVATION':
      return _$identityVerificationReviewUserStatusEnum_PENDING_ACTIVATION;
    case 'ACTIVE':
      return _$identityVerificationReviewUserStatusEnum_ACTIVE;
    case 'INACTIVE':
      return _$identityVerificationReviewUserStatusEnum_INACTIVE;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<IdentityVerificationReviewUserStatusEnum>
_$identityVerificationReviewUserStatusEnumValues =
    BuiltSet<IdentityVerificationReviewUserStatusEnum>(
      const <IdentityVerificationReviewUserStatusEnum>[
        _$identityVerificationReviewUserStatusEnum_PENDING_ACTIVATION,
        _$identityVerificationReviewUserStatusEnum_ACTIVE,
        _$identityVerificationReviewUserStatusEnum_INACTIVE,
      ],
    );

Serializer<IdentityVerificationReviewUserStatusEnum>
_$identityVerificationReviewUserStatusEnumSerializer =
    _$IdentityVerificationReviewUserStatusEnumSerializer();

class _$IdentityVerificationReviewUserStatusEnumSerializer
    implements PrimitiveSerializer<IdentityVerificationReviewUserStatusEnum> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'PENDING_ACTIVATION': 'PENDING_ACTIVATION',
    'ACTIVE': 'ACTIVE',
    'INACTIVE': 'INACTIVE',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'PENDING_ACTIVATION': 'PENDING_ACTIVATION',
    'ACTIVE': 'ACTIVE',
    'INACTIVE': 'INACTIVE',
  };

  @override
  final Iterable<Type> types = const <Type>[
    IdentityVerificationReviewUserStatusEnum,
  ];
  @override
  final String wireName = 'IdentityVerificationReviewUserStatusEnum';

  @override
  Object serialize(
    Serializers serializers,
    IdentityVerificationReviewUserStatusEnum object, {
    FullType specifiedType = FullType.unspecified,
  }) => _toWire[object.name] ?? object.name;

  @override
  IdentityVerificationReviewUserStatusEnum deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) => IdentityVerificationReviewUserStatusEnum.valueOf(
    _fromWire[serialized] ?? (serialized is String ? serialized : ''),
  );
}

class _$IdentityVerificationReviewUser extends IdentityVerificationReviewUser {
  @override
  final String id;
  @override
  final String displayName;
  @override
  final String? phoneMasked;
  @override
  final IdentityVerificationReviewUserStatusEnum status;

  factory _$IdentityVerificationReviewUser([
    void Function(IdentityVerificationReviewUserBuilder)? updates,
  ]) => (IdentityVerificationReviewUserBuilder()..update(updates))._build();

  _$IdentityVerificationReviewUser._({
    required this.id,
    required this.displayName,
    this.phoneMasked,
    required this.status,
  }) : super._();
  @override
  IdentityVerificationReviewUser rebuild(
    void Function(IdentityVerificationReviewUserBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  IdentityVerificationReviewUserBuilder toBuilder() =>
      IdentityVerificationReviewUserBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is IdentityVerificationReviewUser &&
        id == other.id &&
        displayName == other.displayName &&
        phoneMasked == other.phoneMasked &&
        status == other.status;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, id.hashCode);
    _$hash = $jc(_$hash, displayName.hashCode);
    _$hash = $jc(_$hash, phoneMasked.hashCode);
    _$hash = $jc(_$hash, status.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'IdentityVerificationReviewUser')
          ..add('id', id)
          ..add('displayName', displayName)
          ..add('phoneMasked', phoneMasked)
          ..add('status', status))
        .toString();
  }
}

class IdentityVerificationReviewUserBuilder
    implements
        Builder<
          IdentityVerificationReviewUser,
          IdentityVerificationReviewUserBuilder
        > {
  _$IdentityVerificationReviewUser? _$v;

  String? _id;
  String? get id => _$this._id;
  set id(String? id) => _$this._id = id;

  String? _displayName;
  String? get displayName => _$this._displayName;
  set displayName(String? displayName) => _$this._displayName = displayName;

  String? _phoneMasked;
  String? get phoneMasked => _$this._phoneMasked;
  set phoneMasked(String? phoneMasked) => _$this._phoneMasked = phoneMasked;

  IdentityVerificationReviewUserStatusEnum? _status;
  IdentityVerificationReviewUserStatusEnum? get status => _$this._status;
  set status(IdentityVerificationReviewUserStatusEnum? status) =>
      _$this._status = status;

  IdentityVerificationReviewUserBuilder() {
    IdentityVerificationReviewUser._defaults(this);
  }

  IdentityVerificationReviewUserBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _id = $v.id;
      _displayName = $v.displayName;
      _phoneMasked = $v.phoneMasked;
      _status = $v.status;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(IdentityVerificationReviewUser other) {
    _$v = other as _$IdentityVerificationReviewUser;
  }

  @override
  void update(void Function(IdentityVerificationReviewUserBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  IdentityVerificationReviewUser build() => _build();

  _$IdentityVerificationReviewUser _build() {
    final _$result =
        _$v ??
        _$IdentityVerificationReviewUser._(
          id: BuiltValueNullFieldError.checkNotNull(
            id,
            r'IdentityVerificationReviewUser',
            'id',
          ),
          displayName: BuiltValueNullFieldError.checkNotNull(
            displayName,
            r'IdentityVerificationReviewUser',
            'displayName',
          ),
          phoneMasked: phoneMasked,
          status: BuiltValueNullFieldError.checkNotNull(
            status,
            r'IdentityVerificationReviewUser',
            'status',
          ),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
