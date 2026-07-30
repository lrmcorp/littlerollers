// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'branch_management_detail.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$BranchManagementDetail extends BranchManagementDetail {
  @override
  final BuiltList<BranchAuditActivity> auditActivity;
  @override
  final BranchDependencySummary dependencies;
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

  factory _$BranchManagementDetail([
    void Function(BranchManagementDetailBuilder)? updates,
  ]) => (BranchManagementDetailBuilder()..update(updates))._build();

  _$BranchManagementDetail._({
    required this.auditActivity,
    required this.dependencies,
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
  BranchManagementDetail rebuild(
    void Function(BranchManagementDetailBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  BranchManagementDetailBuilder toBuilder() =>
      BranchManagementDetailBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is BranchManagementDetail &&
        auditActivity == other.auditActivity &&
        dependencies == other.dependencies &&
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
    _$hash = $jc(_$hash, auditActivity.hashCode);
    _$hash = $jc(_$hash, dependencies.hashCode);
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
    return (newBuiltValueToStringHelper(r'BranchManagementDetail')
          ..add('auditActivity', auditActivity)
          ..add('dependencies', dependencies)
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

class BranchManagementDetailBuilder
    implements
        Builder<BranchManagementDetail, BranchManagementDetailBuilder>,
        BranchBuilder {
  _$BranchManagementDetail? _$v;

  ListBuilder<BranchAuditActivity>? _auditActivity;
  ListBuilder<BranchAuditActivity> get auditActivity =>
      _$this._auditActivity ??= ListBuilder<BranchAuditActivity>();
  set auditActivity(
    covariant ListBuilder<BranchAuditActivity>? auditActivity,
  ) => _$this._auditActivity = auditActivity;

  BranchDependencySummaryBuilder? _dependencies;
  BranchDependencySummaryBuilder get dependencies =>
      _$this._dependencies ??= BranchDependencySummaryBuilder();
  set dependencies(covariant BranchDependencySummaryBuilder? dependencies) =>
      _$this._dependencies = dependencies;

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

  BranchManagementDetailBuilder() {
    BranchManagementDetail._defaults(this);
  }

  BranchManagementDetailBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _auditActivity = $v.auditActivity.toBuilder();
      _dependencies = $v.dependencies.toBuilder();
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
  void replace(covariant BranchManagementDetail other) {
    _$v = other as _$BranchManagementDetail;
  }

  @override
  void update(void Function(BranchManagementDetailBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  BranchManagementDetail build() => _build();

  _$BranchManagementDetail _build() {
    _$BranchManagementDetail _$result;
    try {
      _$result =
          _$v ??
          _$BranchManagementDetail._(
            auditActivity: auditActivity.build(),
            dependencies: dependencies.build(),
            id: BuiltValueNullFieldError.checkNotNull(
              id,
              r'BranchManagementDetail',
              'id',
            ),
            code: BuiltValueNullFieldError.checkNotNull(
              code,
              r'BranchManagementDetail',
              'code',
            ),
            name: BuiltValueNullFieldError.checkNotNull(
              name,
              r'BranchManagementDetail',
              'name',
            ),
            timezone: BuiltValueNullFieldError.checkNotNull(
              timezone,
              r'BranchManagementDetail',
              'timezone',
            ),
            supportWhatsappE164: supportWhatsappE164,
            active: BuiltValueNullFieldError.checkNotNull(
              active,
              r'BranchManagementDetail',
              'active',
            ),
            version: BuiltValueNullFieldError.checkNotNull(
              version,
              r'BranchManagementDetail',
              'version',
            ),
            publicProfile: _publicProfile?.build(),
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'auditActivity';
        auditActivity.build();
        _$failedField = 'dependencies';
        dependencies.build();

        _$failedField = 'publicProfile';
        _publicProfile?.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
          r'BranchManagementDetail',
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
