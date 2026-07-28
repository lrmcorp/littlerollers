// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'public_studio_detail_all_of_classes.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$PublicStudioDetailAllOfClasses extends PublicStudioDetailAllOfClasses {
  @override
  final String code;
  @override
  final String name;
  @override
  final PublicClassProfile profile;

  factory _$PublicStudioDetailAllOfClasses([
    void Function(PublicStudioDetailAllOfClassesBuilder)? updates,
  ]) => (PublicStudioDetailAllOfClassesBuilder()..update(updates))._build();

  _$PublicStudioDetailAllOfClasses._({
    required this.code,
    required this.name,
    required this.profile,
  }) : super._();
  @override
  PublicStudioDetailAllOfClasses rebuild(
    void Function(PublicStudioDetailAllOfClassesBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  PublicStudioDetailAllOfClassesBuilder toBuilder() =>
      PublicStudioDetailAllOfClassesBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is PublicStudioDetailAllOfClasses &&
        code == other.code &&
        name == other.name &&
        profile == other.profile;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, code.hashCode);
    _$hash = $jc(_$hash, name.hashCode);
    _$hash = $jc(_$hash, profile.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'PublicStudioDetailAllOfClasses')
          ..add('code', code)
          ..add('name', name)
          ..add('profile', profile))
        .toString();
  }
}

class PublicStudioDetailAllOfClassesBuilder
    implements
        Builder<
          PublicStudioDetailAllOfClasses,
          PublicStudioDetailAllOfClassesBuilder
        > {
  _$PublicStudioDetailAllOfClasses? _$v;

  String? _code;
  String? get code => _$this._code;
  set code(String? code) => _$this._code = code;

  String? _name;
  String? get name => _$this._name;
  set name(String? name) => _$this._name = name;

  PublicClassProfile? _profile;
  PublicClassProfile? get profile => _$this._profile;
  set profile(PublicClassProfile? profile) => _$this._profile = profile;

  PublicStudioDetailAllOfClassesBuilder() {
    PublicStudioDetailAllOfClasses._defaults(this);
  }

  PublicStudioDetailAllOfClassesBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _code = $v.code;
      _name = $v.name;
      _profile = $v.profile;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(PublicStudioDetailAllOfClasses other) {
    _$v = other as _$PublicStudioDetailAllOfClasses;
  }

  @override
  void update(void Function(PublicStudioDetailAllOfClassesBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  PublicStudioDetailAllOfClasses build() => _build();

  _$PublicStudioDetailAllOfClasses _build() {
    final _$result =
        _$v ??
        _$PublicStudioDetailAllOfClasses._(
          code: BuiltValueNullFieldError.checkNotNull(
            code,
            r'PublicStudioDetailAllOfClasses',
            'code',
          ),
          name: BuiltValueNullFieldError.checkNotNull(
            name,
            r'PublicStudioDetailAllOfClasses',
            'name',
          ),
          profile: BuiltValueNullFieldError.checkNotNull(
            profile,
            r'PublicStudioDetailAllOfClasses',
            'profile',
          ),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
