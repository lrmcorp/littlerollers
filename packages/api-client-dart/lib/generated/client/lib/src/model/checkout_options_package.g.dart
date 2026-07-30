// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'checkout_options_package.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$CheckoutOptionsPackage extends CheckoutOptionsPackage {
  @override
  final String id;
  @override
  final String name;
  @override
  final int priceRp;
  @override
  final int effectivePriceRp;
  @override
  final PublicPackagePromotion? promotion;
  @override
  final int version;
  @override
  final int sessionCount;
  @override
  final int durationDays;
  @override
  final String branchId;
  @override
  final String branchName;
  @override
  final String classTypeId;
  @override
  final String classTypeName;

  factory _$CheckoutOptionsPackage([
    void Function(CheckoutOptionsPackageBuilder)? updates,
  ]) => (CheckoutOptionsPackageBuilder()..update(updates))._build();

  _$CheckoutOptionsPackage._({
    required this.id,
    required this.name,
    required this.priceRp,
    required this.effectivePriceRp,
    this.promotion,
    required this.version,
    required this.sessionCount,
    required this.durationDays,
    required this.branchId,
    required this.branchName,
    required this.classTypeId,
    required this.classTypeName,
  }) : super._();
  @override
  CheckoutOptionsPackage rebuild(
    void Function(CheckoutOptionsPackageBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  CheckoutOptionsPackageBuilder toBuilder() =>
      CheckoutOptionsPackageBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is CheckoutOptionsPackage &&
        id == other.id &&
        name == other.name &&
        priceRp == other.priceRp &&
        effectivePriceRp == other.effectivePriceRp &&
        promotion == other.promotion &&
        version == other.version &&
        sessionCount == other.sessionCount &&
        durationDays == other.durationDays &&
        branchId == other.branchId &&
        branchName == other.branchName &&
        classTypeId == other.classTypeId &&
        classTypeName == other.classTypeName;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, id.hashCode);
    _$hash = $jc(_$hash, name.hashCode);
    _$hash = $jc(_$hash, priceRp.hashCode);
    _$hash = $jc(_$hash, effectivePriceRp.hashCode);
    _$hash = $jc(_$hash, promotion.hashCode);
    _$hash = $jc(_$hash, version.hashCode);
    _$hash = $jc(_$hash, sessionCount.hashCode);
    _$hash = $jc(_$hash, durationDays.hashCode);
    _$hash = $jc(_$hash, branchId.hashCode);
    _$hash = $jc(_$hash, branchName.hashCode);
    _$hash = $jc(_$hash, classTypeId.hashCode);
    _$hash = $jc(_$hash, classTypeName.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'CheckoutOptionsPackage')
          ..add('id', id)
          ..add('name', name)
          ..add('priceRp', priceRp)
          ..add('effectivePriceRp', effectivePriceRp)
          ..add('promotion', promotion)
          ..add('version', version)
          ..add('sessionCount', sessionCount)
          ..add('durationDays', durationDays)
          ..add('branchId', branchId)
          ..add('branchName', branchName)
          ..add('classTypeId', classTypeId)
          ..add('classTypeName', classTypeName))
        .toString();
  }
}

class CheckoutOptionsPackageBuilder
    implements Builder<CheckoutOptionsPackage, CheckoutOptionsPackageBuilder> {
  _$CheckoutOptionsPackage? _$v;

  String? _id;
  String? get id => _$this._id;
  set id(String? id) => _$this._id = id;

  String? _name;
  String? get name => _$this._name;
  set name(String? name) => _$this._name = name;

  int? _priceRp;
  int? get priceRp => _$this._priceRp;
  set priceRp(int? priceRp) => _$this._priceRp = priceRp;

  int? _effectivePriceRp;
  int? get effectivePriceRp => _$this._effectivePriceRp;
  set effectivePriceRp(int? effectivePriceRp) =>
      _$this._effectivePriceRp = effectivePriceRp;

  PublicPackagePromotionBuilder? _promotion;
  PublicPackagePromotionBuilder get promotion =>
      _$this._promotion ??= PublicPackagePromotionBuilder();
  set promotion(PublicPackagePromotionBuilder? promotion) =>
      _$this._promotion = promotion;

  int? _version;
  int? get version => _$this._version;
  set version(int? version) => _$this._version = version;

  int? _sessionCount;
  int? get sessionCount => _$this._sessionCount;
  set sessionCount(int? sessionCount) => _$this._sessionCount = sessionCount;

  int? _durationDays;
  int? get durationDays => _$this._durationDays;
  set durationDays(int? durationDays) => _$this._durationDays = durationDays;

  String? _branchId;
  String? get branchId => _$this._branchId;
  set branchId(String? branchId) => _$this._branchId = branchId;

  String? _branchName;
  String? get branchName => _$this._branchName;
  set branchName(String? branchName) => _$this._branchName = branchName;

  String? _classTypeId;
  String? get classTypeId => _$this._classTypeId;
  set classTypeId(String? classTypeId) => _$this._classTypeId = classTypeId;

  String? _classTypeName;
  String? get classTypeName => _$this._classTypeName;
  set classTypeName(String? classTypeName) =>
      _$this._classTypeName = classTypeName;

  CheckoutOptionsPackageBuilder() {
    CheckoutOptionsPackage._defaults(this);
  }

  CheckoutOptionsPackageBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _id = $v.id;
      _name = $v.name;
      _priceRp = $v.priceRp;
      _effectivePriceRp = $v.effectivePriceRp;
      _promotion = $v.promotion?.toBuilder();
      _version = $v.version;
      _sessionCount = $v.sessionCount;
      _durationDays = $v.durationDays;
      _branchId = $v.branchId;
      _branchName = $v.branchName;
      _classTypeId = $v.classTypeId;
      _classTypeName = $v.classTypeName;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(CheckoutOptionsPackage other) {
    _$v = other as _$CheckoutOptionsPackage;
  }

  @override
  void update(void Function(CheckoutOptionsPackageBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  CheckoutOptionsPackage build() => _build();

  _$CheckoutOptionsPackage _build() {
    _$CheckoutOptionsPackage _$result;
    try {
      _$result =
          _$v ??
          _$CheckoutOptionsPackage._(
            id: BuiltValueNullFieldError.checkNotNull(
              id,
              r'CheckoutOptionsPackage',
              'id',
            ),
            name: BuiltValueNullFieldError.checkNotNull(
              name,
              r'CheckoutOptionsPackage',
              'name',
            ),
            priceRp: BuiltValueNullFieldError.checkNotNull(
              priceRp,
              r'CheckoutOptionsPackage',
              'priceRp',
            ),
            effectivePriceRp: BuiltValueNullFieldError.checkNotNull(
              effectivePriceRp,
              r'CheckoutOptionsPackage',
              'effectivePriceRp',
            ),
            promotion: _promotion?.build(),
            version: BuiltValueNullFieldError.checkNotNull(
              version,
              r'CheckoutOptionsPackage',
              'version',
            ),
            sessionCount: BuiltValueNullFieldError.checkNotNull(
              sessionCount,
              r'CheckoutOptionsPackage',
              'sessionCount',
            ),
            durationDays: BuiltValueNullFieldError.checkNotNull(
              durationDays,
              r'CheckoutOptionsPackage',
              'durationDays',
            ),
            branchId: BuiltValueNullFieldError.checkNotNull(
              branchId,
              r'CheckoutOptionsPackage',
              'branchId',
            ),
            branchName: BuiltValueNullFieldError.checkNotNull(
              branchName,
              r'CheckoutOptionsPackage',
              'branchName',
            ),
            classTypeId: BuiltValueNullFieldError.checkNotNull(
              classTypeId,
              r'CheckoutOptionsPackage',
              'classTypeId',
            ),
            classTypeName: BuiltValueNullFieldError.checkNotNull(
              classTypeName,
              r'CheckoutOptionsPackage',
              'classTypeName',
            ),
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'promotion';
        _promotion?.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
          r'CheckoutOptionsPackage',
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
