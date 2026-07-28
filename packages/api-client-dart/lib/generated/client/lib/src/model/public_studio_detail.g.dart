// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'public_studio_detail.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$PublicStudioDetail extends PublicStudioDetail {
  @override
  final BuiltList<PublicStudioDetailAllOfClasses> classes;
  @override
  final BuiltList<PublicScheduleSummary> schedules;
  @override
  final BuiltList<PublicPackageSummary> packages;
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
  final PublicBranchProfile publicProfile;

  factory _$PublicStudioDetail([
    void Function(PublicStudioDetailBuilder)? updates,
  ]) => (PublicStudioDetailBuilder()..update(updates))._build();

  _$PublicStudioDetail._({
    required this.classes,
    required this.schedules,
    required this.packages,
    required this.id,
    required this.code,
    required this.name,
    required this.timezone,
    this.supportWhatsappE164,
    required this.publicProfile,
  }) : super._();
  @override
  PublicStudioDetail rebuild(
    void Function(PublicStudioDetailBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  PublicStudioDetailBuilder toBuilder() =>
      PublicStudioDetailBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is PublicStudioDetail &&
        classes == other.classes &&
        schedules == other.schedules &&
        packages == other.packages &&
        id == other.id &&
        code == other.code &&
        name == other.name &&
        timezone == other.timezone &&
        supportWhatsappE164 == other.supportWhatsappE164 &&
        publicProfile == other.publicProfile;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, classes.hashCode);
    _$hash = $jc(_$hash, schedules.hashCode);
    _$hash = $jc(_$hash, packages.hashCode);
    _$hash = $jc(_$hash, id.hashCode);
    _$hash = $jc(_$hash, code.hashCode);
    _$hash = $jc(_$hash, name.hashCode);
    _$hash = $jc(_$hash, timezone.hashCode);
    _$hash = $jc(_$hash, supportWhatsappE164.hashCode);
    _$hash = $jc(_$hash, publicProfile.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'PublicStudioDetail')
          ..add('classes', classes)
          ..add('schedules', schedules)
          ..add('packages', packages)
          ..add('id', id)
          ..add('code', code)
          ..add('name', name)
          ..add('timezone', timezone)
          ..add('supportWhatsappE164', supportWhatsappE164)
          ..add('publicProfile', publicProfile))
        .toString();
  }
}

class PublicStudioDetailBuilder
    implements
        Builder<PublicStudioDetail, PublicStudioDetailBuilder>,
        PublicBranchBuilder {
  _$PublicStudioDetail? _$v;

  ListBuilder<PublicStudioDetailAllOfClasses>? _classes;
  ListBuilder<PublicStudioDetailAllOfClasses> get classes =>
      _$this._classes ??= ListBuilder<PublicStudioDetailAllOfClasses>();
  set classes(covariant ListBuilder<PublicStudioDetailAllOfClasses>? classes) =>
      _$this._classes = classes;

  ListBuilder<PublicScheduleSummary>? _schedules;
  ListBuilder<PublicScheduleSummary> get schedules =>
      _$this._schedules ??= ListBuilder<PublicScheduleSummary>();
  set schedules(covariant ListBuilder<PublicScheduleSummary>? schedules) =>
      _$this._schedules = schedules;

  ListBuilder<PublicPackageSummary>? _packages;
  ListBuilder<PublicPackageSummary> get packages =>
      _$this._packages ??= ListBuilder<PublicPackageSummary>();
  set packages(covariant ListBuilder<PublicPackageSummary>? packages) =>
      _$this._packages = packages;

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

  PublicBranchProfileBuilder? _publicProfile;
  PublicBranchProfileBuilder get publicProfile =>
      _$this._publicProfile ??= PublicBranchProfileBuilder();
  set publicProfile(covariant PublicBranchProfileBuilder? publicProfile) =>
      _$this._publicProfile = publicProfile;

  PublicStudioDetailBuilder() {
    PublicStudioDetail._defaults(this);
  }

  PublicStudioDetailBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _classes = $v.classes.toBuilder();
      _schedules = $v.schedules.toBuilder();
      _packages = $v.packages.toBuilder();
      _id = $v.id;
      _code = $v.code;
      _name = $v.name;
      _timezone = $v.timezone;
      _supportWhatsappE164 = $v.supportWhatsappE164;
      _publicProfile = $v.publicProfile.toBuilder();
      _$v = null;
    }
    return this;
  }

  @override
  void replace(covariant PublicStudioDetail other) {
    _$v = other as _$PublicStudioDetail;
  }

  @override
  void update(void Function(PublicStudioDetailBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  PublicStudioDetail build() => _build();

  _$PublicStudioDetail _build() {
    _$PublicStudioDetail _$result;
    try {
      _$result =
          _$v ??
          _$PublicStudioDetail._(
            classes: classes.build(),
            schedules: schedules.build(),
            packages: packages.build(),
            id: BuiltValueNullFieldError.checkNotNull(
              id,
              r'PublicStudioDetail',
              'id',
            ),
            code: BuiltValueNullFieldError.checkNotNull(
              code,
              r'PublicStudioDetail',
              'code',
            ),
            name: BuiltValueNullFieldError.checkNotNull(
              name,
              r'PublicStudioDetail',
              'name',
            ),
            timezone: BuiltValueNullFieldError.checkNotNull(
              timezone,
              r'PublicStudioDetail',
              'timezone',
            ),
            supportWhatsappE164: supportWhatsappE164,
            publicProfile: publicProfile.build(),
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'classes';
        classes.build();
        _$failedField = 'schedules';
        schedules.build();
        _$failedField = 'packages';
        packages.build();

        _$failedField = 'publicProfile';
        publicProfile.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
          r'PublicStudioDetail',
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
