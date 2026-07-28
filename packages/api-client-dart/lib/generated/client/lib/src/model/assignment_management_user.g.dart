// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'assignment_management_user.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$AssignmentManagementUser extends AssignmentManagementUser {
  @override
  final String id;
  @override
  final String displayName;
  @override
  final String? phoneMasked;

  factory _$AssignmentManagementUser([
    void Function(AssignmentManagementUserBuilder)? updates,
  ]) => (AssignmentManagementUserBuilder()..update(updates))._build();

  _$AssignmentManagementUser._({
    required this.id,
    required this.displayName,
    this.phoneMasked,
  }) : super._();
  @override
  AssignmentManagementUser rebuild(
    void Function(AssignmentManagementUserBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  AssignmentManagementUserBuilder toBuilder() =>
      AssignmentManagementUserBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is AssignmentManagementUser &&
        id == other.id &&
        displayName == other.displayName &&
        phoneMasked == other.phoneMasked;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, id.hashCode);
    _$hash = $jc(_$hash, displayName.hashCode);
    _$hash = $jc(_$hash, phoneMasked.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'AssignmentManagementUser')
          ..add('id', id)
          ..add('displayName', displayName)
          ..add('phoneMasked', phoneMasked))
        .toString();
  }
}

class AssignmentManagementUserBuilder
    implements
        Builder<AssignmentManagementUser, AssignmentManagementUserBuilder> {
  _$AssignmentManagementUser? _$v;

  String? _id;
  String? get id => _$this._id;
  set id(String? id) => _$this._id = id;

  String? _displayName;
  String? get displayName => _$this._displayName;
  set displayName(String? displayName) => _$this._displayName = displayName;

  String? _phoneMasked;
  String? get phoneMasked => _$this._phoneMasked;
  set phoneMasked(String? phoneMasked) => _$this._phoneMasked = phoneMasked;

  AssignmentManagementUserBuilder() {
    AssignmentManagementUser._defaults(this);
  }

  AssignmentManagementUserBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _id = $v.id;
      _displayName = $v.displayName;
      _phoneMasked = $v.phoneMasked;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(AssignmentManagementUser other) {
    _$v = other as _$AssignmentManagementUser;
  }

  @override
  void update(void Function(AssignmentManagementUserBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  AssignmentManagementUser build() => _build();

  _$AssignmentManagementUser _build() {
    final _$result =
        _$v ??
        _$AssignmentManagementUser._(
          id: BuiltValueNullFieldError.checkNotNull(
            id,
            r'AssignmentManagementUser',
            'id',
          ),
          displayName: BuiltValueNullFieldError.checkNotNull(
            displayName,
            r'AssignmentManagementUser',
            'displayName',
          ),
          phoneMasked: phoneMasked,
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
