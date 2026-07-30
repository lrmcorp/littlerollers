// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'branch.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

abstract mixin class BranchBuilder {
  void replace(Branch other);
  void update(void Function(BranchBuilder) updates);
  String? get id;
  set id(String? id);

  String? get code;
  set code(String? code);

  String? get name;
  set name(String? name);

  String? get timezone;
  set timezone(String? timezone);

  String? get supportWhatsappE164;
  set supportWhatsappE164(String? supportWhatsappE164);

  bool? get active;
  set active(bool? active);

  int? get version;
  set version(int? version);

  BranchPublicProfileSummaryBuilder get publicProfile;
  set publicProfile(BranchPublicProfileSummaryBuilder? publicProfile);
}

class _$$Branch extends $Branch {
  @override
  final String id;
  @override
  final String code;
  @override
  final String name;
  @override
  final String timezone;
  @override
  final String? supportWhatsappE164;
  @override
  final bool active;
  @override
  final int version;
  @override
  final BranchPublicProfileSummary? publicProfile;

  factory _$$Branch([void Function($BranchBuilder)? updates]) =>
      ($BranchBuilder()..update(updates))._build();

  _$$Branch._({
    required this.id,
    required this.code,
    required this.name,
    required this.timezone,
    this.supportWhatsappE164,
    required this.active,
    required this.version,
    this.publicProfile,
  }) : super._();
  @override
  $Branch rebuild(void Function($BranchBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  $BranchBuilder toBuilder() => $BranchBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is $Branch &&
        id == other.id &&
        code == other.code &&
        name == other.name &&
        timezone == other.timezone &&
        supportWhatsappE164 == other.supportWhatsappE164 &&
        active == other.active &&
        version == other.version &&
        publicProfile == other.publicProfile;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, id.hashCode);
    _$hash = $jc(_$hash, code.hashCode);
    _$hash = $jc(_$hash, name.hashCode);
    _$hash = $jc(_$hash, timezone.hashCode);
    _$hash = $jc(_$hash, supportWhatsappE164.hashCode);
    _$hash = $jc(_$hash, active.hashCode);
    _$hash = $jc(_$hash, version.hashCode);
    _$hash = $jc(_$hash, publicProfile.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'$Branch')
          ..add('id', id)
          ..add('code', code)
          ..add('name', name)
          ..add('timezone', timezone)
          ..add('supportWhatsappE164', supportWhatsappE164)
          ..add('active', active)
          ..add('version', version)
          ..add('publicProfile', publicProfile))
        .toString();
  }
}

class $BranchBuilder
    implements Builder<$Branch, $BranchBuilder>, BranchBuilder {
  _$$Branch? _$v;

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

  String? _supportWhatsappE164;
  String? get supportWhatsappE164 => _$this._supportWhatsappE164;
  set supportWhatsappE164(covariant String? supportWhatsappE164) =>
      _$this._supportWhatsappE164 = supportWhatsappE164;

  bool? _active;
  bool? get active => _$this._active;
  set active(covariant bool? active) => _$this._active = active;

  int? _version;
  int? get version => _$this._version;
  set version(covariant int? version) => _$this._version = version;

  BranchPublicProfileSummaryBuilder? _publicProfile;
  BranchPublicProfileSummaryBuilder get publicProfile =>
      _$this._publicProfile ??= BranchPublicProfileSummaryBuilder();
  set publicProfile(
    covariant BranchPublicProfileSummaryBuilder? publicProfile,
  ) => _$this._publicProfile = publicProfile;

  $BranchBuilder() {
    $Branch._defaults(this);
  }

  $BranchBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _id = $v.id;
      _code = $v.code;
      _name = $v.name;
      _timezone = $v.timezone;
      _supportWhatsappE164 = $v.supportWhatsappE164;
      _active = $v.active;
      _version = $v.version;
      _publicProfile = $v.publicProfile?.toBuilder();
      _$v = null;
    }
    return this;
  }

  @override
  void replace(covariant $Branch other) {
    _$v = other as _$$Branch;
  }

  @override
  void update(void Function($BranchBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  $Branch build() => _build();

  _$$Branch _build() {
    _$$Branch _$result;
    try {
      _$result =
          _$v ??
          _$$Branch._(
            id: BuiltValueNullFieldError.checkNotNull(id, r'$Branch', 'id'),
            code: BuiltValueNullFieldError.checkNotNull(
              code,
              r'$Branch',
              'code',
            ),
            name: BuiltValueNullFieldError.checkNotNull(
              name,
              r'$Branch',
              'name',
            ),
            timezone: BuiltValueNullFieldError.checkNotNull(
              timezone,
              r'$Branch',
              'timezone',
            ),
            supportWhatsappE164: supportWhatsappE164,
            active: BuiltValueNullFieldError.checkNotNull(
              active,
              r'$Branch',
              'active',
            ),
            version: BuiltValueNullFieldError.checkNotNull(
              version,
              r'$Branch',
              'version',
            ),
            publicProfile: _publicProfile?.build(),
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'publicProfile';
        _publicProfile?.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
          r'$Branch',
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
