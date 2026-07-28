// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'my_profile.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$MyProfile extends MyProfile {
  @override
  final String id;
  @override
  final String displayName;
  @override
  final String? emailMasked;
  @override
  final String? phoneMasked;
  @override
  final PreferredStudio? preferredBranch;
  @override
  final int version;

  factory _$MyProfile([void Function(MyProfileBuilder)? updates]) =>
      (MyProfileBuilder()..update(updates))._build();

  _$MyProfile._({
    required this.id,
    required this.displayName,
    this.emailMasked,
    this.phoneMasked,
    this.preferredBranch,
    required this.version,
  }) : super._();
  @override
  MyProfile rebuild(void Function(MyProfileBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  MyProfileBuilder toBuilder() => MyProfileBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is MyProfile &&
        id == other.id &&
        displayName == other.displayName &&
        emailMasked == other.emailMasked &&
        phoneMasked == other.phoneMasked &&
        preferredBranch == other.preferredBranch &&
        version == other.version;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, id.hashCode);
    _$hash = $jc(_$hash, displayName.hashCode);
    _$hash = $jc(_$hash, emailMasked.hashCode);
    _$hash = $jc(_$hash, phoneMasked.hashCode);
    _$hash = $jc(_$hash, preferredBranch.hashCode);
    _$hash = $jc(_$hash, version.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'MyProfile')
          ..add('id', id)
          ..add('displayName', displayName)
          ..add('emailMasked', emailMasked)
          ..add('phoneMasked', phoneMasked)
          ..add('preferredBranch', preferredBranch)
          ..add('version', version))
        .toString();
  }
}

class MyProfileBuilder implements Builder<MyProfile, MyProfileBuilder> {
  _$MyProfile? _$v;

  String? _id;
  String? get id => _$this._id;
  set id(String? id) => _$this._id = id;

  String? _displayName;
  String? get displayName => _$this._displayName;
  set displayName(String? displayName) => _$this._displayName = displayName;

  String? _emailMasked;
  String? get emailMasked => _$this._emailMasked;
  set emailMasked(String? emailMasked) => _$this._emailMasked = emailMasked;

  String? _phoneMasked;
  String? get phoneMasked => _$this._phoneMasked;
  set phoneMasked(String? phoneMasked) => _$this._phoneMasked = phoneMasked;

  PreferredStudioBuilder? _preferredBranch;
  PreferredStudioBuilder get preferredBranch =>
      _$this._preferredBranch ??= PreferredStudioBuilder();
  set preferredBranch(PreferredStudioBuilder? preferredBranch) =>
      _$this._preferredBranch = preferredBranch;

  int? _version;
  int? get version => _$this._version;
  set version(int? version) => _$this._version = version;

  MyProfileBuilder() {
    MyProfile._defaults(this);
  }

  MyProfileBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _id = $v.id;
      _displayName = $v.displayName;
      _emailMasked = $v.emailMasked;
      _phoneMasked = $v.phoneMasked;
      _preferredBranch = $v.preferredBranch?.toBuilder();
      _version = $v.version;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(MyProfile other) {
    _$v = other as _$MyProfile;
  }

  @override
  void update(void Function(MyProfileBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  MyProfile build() => _build();

  _$MyProfile _build() {
    _$MyProfile _$result;
    try {
      _$result =
          _$v ??
          _$MyProfile._(
            id: BuiltValueNullFieldError.checkNotNull(id, r'MyProfile', 'id'),
            displayName: BuiltValueNullFieldError.checkNotNull(
              displayName,
              r'MyProfile',
              'displayName',
            ),
            emailMasked: emailMasked,
            phoneMasked: phoneMasked,
            preferredBranch: _preferredBranch?.build(),
            version: BuiltValueNullFieldError.checkNotNull(
              version,
              r'MyProfile',
              'version',
            ),
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'preferredBranch';
        _preferredBranch?.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
          r'MyProfile',
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
