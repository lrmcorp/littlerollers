// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'preferred_studio.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$PreferredStudio extends PreferredStudio {
  @override
  final String? supportWhatsappE164;
  @override
  final String id;
  @override
  final String code;
  @override
  final String name;
  @override
  final String timezone;

  factory _$PreferredStudio([void Function(PreferredStudioBuilder)? updates]) =>
      (PreferredStudioBuilder()..update(updates))._build();

  _$PreferredStudio._({
    this.supportWhatsappE164,
    required this.id,
    required this.code,
    required this.name,
    required this.timezone,
  }) : super._();
  @override
  PreferredStudio rebuild(void Function(PreferredStudioBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  PreferredStudioBuilder toBuilder() => PreferredStudioBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is PreferredStudio &&
        supportWhatsappE164 == other.supportWhatsappE164 &&
        id == other.id &&
        code == other.code &&
        name == other.name &&
        timezone == other.timezone;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, supportWhatsappE164.hashCode);
    _$hash = $jc(_$hash, id.hashCode);
    _$hash = $jc(_$hash, code.hashCode);
    _$hash = $jc(_$hash, name.hashCode);
    _$hash = $jc(_$hash, timezone.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'PreferredStudio')
          ..add('supportWhatsappE164', supportWhatsappE164)
          ..add('id', id)
          ..add('code', code)
          ..add('name', name)
          ..add('timezone', timezone))
        .toString();
  }
}

class PreferredStudioBuilder
    implements
        Builder<PreferredStudio, PreferredStudioBuilder>,
        SessionBranchBuilder {
  _$PreferredStudio? _$v;

  String? _supportWhatsappE164;
  String? get supportWhatsappE164 => _$this._supportWhatsappE164;
  set supportWhatsappE164(covariant String? supportWhatsappE164) =>
      _$this._supportWhatsappE164 = supportWhatsappE164;

  String? _id;
  String? get id => _$this._id;
  set id(covariant String? id) => _$this._id = id;

  String? _code;
  String? get code => _$this._code;
  set code(covariant String? code) => _$this._code = code;

  String? _name;
  String? get name => _$this._name;
  set name(covariant String? name) => _$this._name = name;

  String? _timezone;
  String? get timezone => _$this._timezone;
  set timezone(covariant String? timezone) => _$this._timezone = timezone;

  PreferredStudioBuilder() {
    PreferredStudio._defaults(this);
  }

  PreferredStudioBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _supportWhatsappE164 = $v.supportWhatsappE164;
      _id = $v.id;
      _code = $v.code;
      _name = $v.name;
      _timezone = $v.timezone;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(covariant PreferredStudio other) {
    _$v = other as _$PreferredStudio;
  }

  @override
  void update(void Function(PreferredStudioBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  PreferredStudio build() => _build();

  _$PreferredStudio _build() {
    final _$result =
        _$v ??
        _$PreferredStudio._(
          supportWhatsappE164: supportWhatsappE164,
          id: BuiltValueNullFieldError.checkNotNull(
            id,
            r'PreferredStudio',
            'id',
          ),
          code: BuiltValueNullFieldError.checkNotNull(
            code,
            r'PreferredStudio',
            'code',
          ),
          name: BuiltValueNullFieldError.checkNotNull(
            name,
            r'PreferredStudio',
            'name',
          ),
          timezone: BuiltValueNullFieldError.checkNotNull(
            timezone,
            r'PreferredStudio',
            'timezone',
          ),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
