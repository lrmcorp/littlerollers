// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'public_package_summary.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

abstract mixin class PublicPackageSummaryBuilder {
  void replace(PublicPackageSummary other);
  void update(void Function(PublicPackageSummaryBuilder) updates);
  String? get id;
  set id(String? id);

  String? get branchId;
  set branchId(String? branchId);

  String? get name;
  set name(String? name);

  int? get sessionCount;
  set sessionCount(int? sessionCount);

  int? get durationDays;
  set durationDays(int? durationDays);

  int? get priceRp;
  set priceRp(int? priceRp);

  int? get effectivePriceRp;
  set effectivePriceRp(int? effectivePriceRp);

  PublicPackagePromotionBuilder get promotion;
  set promotion(PublicPackagePromotionBuilder? promotion);

  DateTime? get effectiveUntil;
  set effectiveUntil(DateTime? effectiveUntil);

  PublicClassTypeRefBuilder get classType;
  set classType(PublicClassTypeRefBuilder? classType);

  PublicPackageProfileBuilder get publicProfile;
  set publicProfile(PublicPackageProfileBuilder? publicProfile);

  PublicBranch? get branch;
  set branch(PublicBranch? branch);
}

class _$$PublicPackageSummary extends $PublicPackageSummary {
  @override
  final String id;
  @override
  final String? branchId;
  @override
  final String name;
  @override
  final int sessionCount;
  @override
  final int durationDays;
  @override
  final int priceRp;
  @override
  final int effectivePriceRp;
  @override
  final PublicPackagePromotion? promotion;
  @override
  final DateTime? effectiveUntil;
  @override
  final PublicClassTypeRef? classType;
  @override
  final PublicPackageProfile? publicProfile;
  @override
  final PublicBranch? branch;

  factory _$$PublicPackageSummary([
    void Function($PublicPackageSummaryBuilder)? updates,
  ]) => ($PublicPackageSummaryBuilder()..update(updates))._build();

  _$$PublicPackageSummary._({
    required this.id,
    this.branchId,
    required this.name,
    required this.sessionCount,
    required this.durationDays,
    required this.priceRp,
    required this.effectivePriceRp,
    this.promotion,
    this.effectiveUntil,
    this.classType,
    this.publicProfile,
    this.branch,
  }) : super._();
  @override
  $PublicPackageSummary rebuild(
    void Function($PublicPackageSummaryBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  $PublicPackageSummaryBuilder toBuilder() =>
      $PublicPackageSummaryBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is $PublicPackageSummary &&
        id == other.id &&
        branchId == other.branchId &&
        name == other.name &&
        sessionCount == other.sessionCount &&
        durationDays == other.durationDays &&
        priceRp == other.priceRp &&
        effectivePriceRp == other.effectivePriceRp &&
        promotion == other.promotion &&
        effectiveUntil == other.effectiveUntil &&
        classType == other.classType &&
        publicProfile == other.publicProfile &&
        branch == other.branch;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, id.hashCode);
    _$hash = $jc(_$hash, branchId.hashCode);
    _$hash = $jc(_$hash, name.hashCode);
    _$hash = $jc(_$hash, sessionCount.hashCode);
    _$hash = $jc(_$hash, durationDays.hashCode);
    _$hash = $jc(_$hash, priceRp.hashCode);
    _$hash = $jc(_$hash, effectivePriceRp.hashCode);
    _$hash = $jc(_$hash, promotion.hashCode);
    _$hash = $jc(_$hash, effectiveUntil.hashCode);
    _$hash = $jc(_$hash, classType.hashCode);
    _$hash = $jc(_$hash, publicProfile.hashCode);
    _$hash = $jc(_$hash, branch.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'$PublicPackageSummary')
          ..add('id', id)
          ..add('branchId', branchId)
          ..add('name', name)
          ..add('sessionCount', sessionCount)
          ..add('durationDays', durationDays)
          ..add('priceRp', priceRp)
          ..add('effectivePriceRp', effectivePriceRp)
          ..add('promotion', promotion)
          ..add('effectiveUntil', effectiveUntil)
          ..add('classType', classType)
          ..add('publicProfile', publicProfile)
          ..add('branch', branch))
        .toString();
  }
}

class $PublicPackageSummaryBuilder
    implements
        Builder<$PublicPackageSummary, $PublicPackageSummaryBuilder>,
        PublicPackageSummaryBuilder {
  _$$PublicPackageSummary? _$v;

  String? _id;
  String? get id => _$this._id;
  set id(covariant String? id) => _$this._id = id;

  String? _branchId;
  String? get branchId => _$this._branchId;
  set branchId(covariant String? branchId) => _$this._branchId = branchId;

  String? _name;
  String? get name => _$this._name;
  set name(covariant String? name) => _$this._name = name;

  int? _sessionCount;
  int? get sessionCount => _$this._sessionCount;
  set sessionCount(covariant int? sessionCount) =>
      _$this._sessionCount = sessionCount;

  int? _durationDays;
  int? get durationDays => _$this._durationDays;
  set durationDays(covariant int? durationDays) =>
      _$this._durationDays = durationDays;

  int? _priceRp;
  int? get priceRp => _$this._priceRp;
  set priceRp(covariant int? priceRp) => _$this._priceRp = priceRp;

  int? _effectivePriceRp;
  int? get effectivePriceRp => _$this._effectivePriceRp;
  set effectivePriceRp(covariant int? effectivePriceRp) =>
      _$this._effectivePriceRp = effectivePriceRp;

  PublicPackagePromotionBuilder? _promotion;
  PublicPackagePromotionBuilder get promotion =>
      _$this._promotion ??= PublicPackagePromotionBuilder();
  set promotion(covariant PublicPackagePromotionBuilder? promotion) =>
      _$this._promotion = promotion;

  DateTime? _effectiveUntil;
  DateTime? get effectiveUntil => _$this._effectiveUntil;
  set effectiveUntil(covariant DateTime? effectiveUntil) =>
      _$this._effectiveUntil = effectiveUntil;

  PublicClassTypeRefBuilder? _classType;
  PublicClassTypeRefBuilder get classType =>
      _$this._classType ??= PublicClassTypeRefBuilder();
  set classType(covariant PublicClassTypeRefBuilder? classType) =>
      _$this._classType = classType;

  PublicPackageProfileBuilder? _publicProfile;
  PublicPackageProfileBuilder get publicProfile =>
      _$this._publicProfile ??= PublicPackageProfileBuilder();
  set publicProfile(covariant PublicPackageProfileBuilder? publicProfile) =>
      _$this._publicProfile = publicProfile;

  PublicBranch? _branch;
  PublicBranch? get branch => _$this._branch;
  set branch(covariant PublicBranch? branch) => _$this._branch = branch;

  $PublicPackageSummaryBuilder() {
    $PublicPackageSummary._defaults(this);
  }

  $PublicPackageSummaryBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _id = $v.id;
      _branchId = $v.branchId;
      _name = $v.name;
      _sessionCount = $v.sessionCount;
      _durationDays = $v.durationDays;
      _priceRp = $v.priceRp;
      _effectivePriceRp = $v.effectivePriceRp;
      _promotion = $v.promotion?.toBuilder();
      _effectiveUntil = $v.effectiveUntil;
      _classType = $v.classType?.toBuilder();
      _publicProfile = $v.publicProfile?.toBuilder();
      _branch = $v.branch;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(covariant $PublicPackageSummary other) {
    _$v = other as _$$PublicPackageSummary;
  }

  @override
  void update(void Function($PublicPackageSummaryBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  $PublicPackageSummary build() => _build();

  _$$PublicPackageSummary _build() {
    _$$PublicPackageSummary _$result;
    try {
      _$result =
          _$v ??
          _$$PublicPackageSummary._(
            id: BuiltValueNullFieldError.checkNotNull(
              id,
              r'$PublicPackageSummary',
              'id',
            ),
            branchId: branchId,
            name: BuiltValueNullFieldError.checkNotNull(
              name,
              r'$PublicPackageSummary',
              'name',
            ),
            sessionCount: BuiltValueNullFieldError.checkNotNull(
              sessionCount,
              r'$PublicPackageSummary',
              'sessionCount',
            ),
            durationDays: BuiltValueNullFieldError.checkNotNull(
              durationDays,
              r'$PublicPackageSummary',
              'durationDays',
            ),
            priceRp: BuiltValueNullFieldError.checkNotNull(
              priceRp,
              r'$PublicPackageSummary',
              'priceRp',
            ),
            effectivePriceRp: BuiltValueNullFieldError.checkNotNull(
              effectivePriceRp,
              r'$PublicPackageSummary',
              'effectivePriceRp',
            ),
            promotion: _promotion?.build(),
            effectiveUntil: effectiveUntil,
            classType: _classType?.build(),
            publicProfile: _publicProfile?.build(),
            branch: branch,
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'promotion';
        _promotion?.build();

        _$failedField = 'classType';
        _classType?.build();
        _$failedField = 'publicProfile';
        _publicProfile?.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
          r'$PublicPackageSummary',
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
