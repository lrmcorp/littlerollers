// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'voucher.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

const VoucherStatusEnum _$voucherStatusEnum_DRAFT = const VoucherStatusEnum._(
  'DRAFT',
);
const VoucherStatusEnum _$voucherStatusEnum_ACTIVE = const VoucherStatusEnum._(
  'ACTIVE',
);
const VoucherStatusEnum _$voucherStatusEnum_PAUSED = const VoucherStatusEnum._(
  'PAUSED',
);
const VoucherStatusEnum _$voucherStatusEnum_EXPIRED = const VoucherStatusEnum._(
  'EXPIRED',
);
const VoucherStatusEnum _$voucherStatusEnum_EXHAUSTED =
    const VoucherStatusEnum._('EXHAUSTED');
const VoucherStatusEnum _$voucherStatusEnum_ARCHIVED =
    const VoucherStatusEnum._('ARCHIVED');

VoucherStatusEnum _$voucherStatusEnumValueOf(String name) {
  switch (name) {
    case 'DRAFT':
      return _$voucherStatusEnum_DRAFT;
    case 'ACTIVE':
      return _$voucherStatusEnum_ACTIVE;
    case 'PAUSED':
      return _$voucherStatusEnum_PAUSED;
    case 'EXPIRED':
      return _$voucherStatusEnum_EXPIRED;
    case 'EXHAUSTED':
      return _$voucherStatusEnum_EXHAUSTED;
    case 'ARCHIVED':
      return _$voucherStatusEnum_ARCHIVED;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<VoucherStatusEnum> _$voucherStatusEnumValues =
    BuiltSet<VoucherStatusEnum>(const <VoucherStatusEnum>[
      _$voucherStatusEnum_DRAFT,
      _$voucherStatusEnum_ACTIVE,
      _$voucherStatusEnum_PAUSED,
      _$voucherStatusEnum_EXPIRED,
      _$voucherStatusEnum_EXHAUSTED,
      _$voucherStatusEnum_ARCHIVED,
    ]);

const VoucherDiscountTypeEnum _$voucherDiscountTypeEnum_PERCENTAGE =
    const VoucherDiscountTypeEnum._('PERCENTAGE');
const VoucherDiscountTypeEnum _$voucherDiscountTypeEnum_FIXED_AMOUNT =
    const VoucherDiscountTypeEnum._('FIXED_AMOUNT');

VoucherDiscountTypeEnum _$voucherDiscountTypeEnumValueOf(String name) {
  switch (name) {
    case 'PERCENTAGE':
      return _$voucherDiscountTypeEnum_PERCENTAGE;
    case 'FIXED_AMOUNT':
      return _$voucherDiscountTypeEnum_FIXED_AMOUNT;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<VoucherDiscountTypeEnum> _$voucherDiscountTypeEnumValues =
    BuiltSet<VoucherDiscountTypeEnum>(const <VoucherDiscountTypeEnum>[
      _$voucherDiscountTypeEnum_PERCENTAGE,
      _$voucherDiscountTypeEnum_FIXED_AMOUNT,
    ]);

Serializer<VoucherStatusEnum> _$voucherStatusEnumSerializer =
    _$VoucherStatusEnumSerializer();
Serializer<VoucherDiscountTypeEnum> _$voucherDiscountTypeEnumSerializer =
    _$VoucherDiscountTypeEnumSerializer();

class _$VoucherStatusEnumSerializer
    implements PrimitiveSerializer<VoucherStatusEnum> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'DRAFT': 'DRAFT',
    'ACTIVE': 'ACTIVE',
    'PAUSED': 'PAUSED',
    'EXPIRED': 'EXPIRED',
    'EXHAUSTED': 'EXHAUSTED',
    'ARCHIVED': 'ARCHIVED',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'DRAFT': 'DRAFT',
    'ACTIVE': 'ACTIVE',
    'PAUSED': 'PAUSED',
    'EXPIRED': 'EXPIRED',
    'EXHAUSTED': 'EXHAUSTED',
    'ARCHIVED': 'ARCHIVED',
  };

  @override
  final Iterable<Type> types = const <Type>[VoucherStatusEnum];
  @override
  final String wireName = 'VoucherStatusEnum';

  @override
  Object serialize(
    Serializers serializers,
    VoucherStatusEnum object, {
    FullType specifiedType = FullType.unspecified,
  }) => _toWire[object.name] ?? object.name;

  @override
  VoucherStatusEnum deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) => VoucherStatusEnum.valueOf(
    _fromWire[serialized] ?? (serialized is String ? serialized : ''),
  );
}

class _$VoucherDiscountTypeEnumSerializer
    implements PrimitiveSerializer<VoucherDiscountTypeEnum> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'PERCENTAGE': 'PERCENTAGE',
    'FIXED_AMOUNT': 'FIXED_AMOUNT',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'PERCENTAGE': 'PERCENTAGE',
    'FIXED_AMOUNT': 'FIXED_AMOUNT',
  };

  @override
  final Iterable<Type> types = const <Type>[VoucherDiscountTypeEnum];
  @override
  final String wireName = 'VoucherDiscountTypeEnum';

  @override
  Object serialize(
    Serializers serializers,
    VoucherDiscountTypeEnum object, {
    FullType specifiedType = FullType.unspecified,
  }) => _toWire[object.name] ?? object.name;

  @override
  VoucherDiscountTypeEnum deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) => VoucherDiscountTypeEnum.valueOf(
    _fromWire[serialized] ?? (serialized is String ? serialized : ''),
  );
}

class _$Voucher extends Voucher {
  @override
  final String id;
  @override
  final String code;
  @override
  final String name;
  @override
  final String? description;
  @override
  final VoucherStatusEnum status;
  @override
  final VoucherDiscountTypeEnum discountType;
  @override
  final int discountValue;
  @override
  final int? maxDiscountRp;
  @override
  final int minimumPurchaseRp;
  @override
  final DateTime activeFrom;
  @override
  final DateTime? activeUntil;
  @override
  final int? totalUsageLimit;
  @override
  final int? perCustomerUsageLimit;
  @override
  final JsonObject? branch;
  @override
  final JsonObject? classType;
  @override
  final BuiltList<String>? packageIds;
  @override
  final BuiltList<VoucherPackagesInner>? packages;
  @override
  final int? redeemedCount;
  @override
  final int version;

  factory _$Voucher([void Function(VoucherBuilder)? updates]) =>
      (VoucherBuilder()..update(updates))._build();

  _$Voucher._({
    required this.id,
    required this.code,
    required this.name,
    this.description,
    required this.status,
    required this.discountType,
    required this.discountValue,
    this.maxDiscountRp,
    required this.minimumPurchaseRp,
    required this.activeFrom,
    this.activeUntil,
    this.totalUsageLimit,
    this.perCustomerUsageLimit,
    this.branch,
    this.classType,
    this.packageIds,
    this.packages,
    this.redeemedCount,
    required this.version,
  }) : super._();
  @override
  Voucher rebuild(void Function(VoucherBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  VoucherBuilder toBuilder() => VoucherBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is Voucher &&
        id == other.id &&
        code == other.code &&
        name == other.name &&
        description == other.description &&
        status == other.status &&
        discountType == other.discountType &&
        discountValue == other.discountValue &&
        maxDiscountRp == other.maxDiscountRp &&
        minimumPurchaseRp == other.minimumPurchaseRp &&
        activeFrom == other.activeFrom &&
        activeUntil == other.activeUntil &&
        totalUsageLimit == other.totalUsageLimit &&
        perCustomerUsageLimit == other.perCustomerUsageLimit &&
        branch == other.branch &&
        classType == other.classType &&
        packageIds == other.packageIds &&
        packages == other.packages &&
        redeemedCount == other.redeemedCount &&
        version == other.version;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, id.hashCode);
    _$hash = $jc(_$hash, code.hashCode);
    _$hash = $jc(_$hash, name.hashCode);
    _$hash = $jc(_$hash, description.hashCode);
    _$hash = $jc(_$hash, status.hashCode);
    _$hash = $jc(_$hash, discountType.hashCode);
    _$hash = $jc(_$hash, discountValue.hashCode);
    _$hash = $jc(_$hash, maxDiscountRp.hashCode);
    _$hash = $jc(_$hash, minimumPurchaseRp.hashCode);
    _$hash = $jc(_$hash, activeFrom.hashCode);
    _$hash = $jc(_$hash, activeUntil.hashCode);
    _$hash = $jc(_$hash, totalUsageLimit.hashCode);
    _$hash = $jc(_$hash, perCustomerUsageLimit.hashCode);
    _$hash = $jc(_$hash, branch.hashCode);
    _$hash = $jc(_$hash, classType.hashCode);
    _$hash = $jc(_$hash, packageIds.hashCode);
    _$hash = $jc(_$hash, packages.hashCode);
    _$hash = $jc(_$hash, redeemedCount.hashCode);
    _$hash = $jc(_$hash, version.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'Voucher')
          ..add('id', id)
          ..add('code', code)
          ..add('name', name)
          ..add('description', description)
          ..add('status', status)
          ..add('discountType', discountType)
          ..add('discountValue', discountValue)
          ..add('maxDiscountRp', maxDiscountRp)
          ..add('minimumPurchaseRp', minimumPurchaseRp)
          ..add('activeFrom', activeFrom)
          ..add('activeUntil', activeUntil)
          ..add('totalUsageLimit', totalUsageLimit)
          ..add('perCustomerUsageLimit', perCustomerUsageLimit)
          ..add('branch', branch)
          ..add('classType', classType)
          ..add('packageIds', packageIds)
          ..add('packages', packages)
          ..add('redeemedCount', redeemedCount)
          ..add('version', version))
        .toString();
  }
}

class VoucherBuilder implements Builder<Voucher, VoucherBuilder> {
  _$Voucher? _$v;

  String? _id;
  String? get id => _$this._id;
  set id(String? id) => _$this._id = id;

  String? _code;
  String? get code => _$this._code;
  set code(String? code) => _$this._code = code;

  String? _name;
  String? get name => _$this._name;
  set name(String? name) => _$this._name = name;

  String? _description;
  String? get description => _$this._description;
  set description(String? description) => _$this._description = description;

  VoucherStatusEnum? _status;
  VoucherStatusEnum? get status => _$this._status;
  set status(VoucherStatusEnum? status) => _$this._status = status;

  VoucherDiscountTypeEnum? _discountType;
  VoucherDiscountTypeEnum? get discountType => _$this._discountType;
  set discountType(VoucherDiscountTypeEnum? discountType) =>
      _$this._discountType = discountType;

  int? _discountValue;
  int? get discountValue => _$this._discountValue;
  set discountValue(int? discountValue) =>
      _$this._discountValue = discountValue;

  int? _maxDiscountRp;
  int? get maxDiscountRp => _$this._maxDiscountRp;
  set maxDiscountRp(int? maxDiscountRp) =>
      _$this._maxDiscountRp = maxDiscountRp;

  int? _minimumPurchaseRp;
  int? get minimumPurchaseRp => _$this._minimumPurchaseRp;
  set minimumPurchaseRp(int? minimumPurchaseRp) =>
      _$this._minimumPurchaseRp = minimumPurchaseRp;

  DateTime? _activeFrom;
  DateTime? get activeFrom => _$this._activeFrom;
  set activeFrom(DateTime? activeFrom) => _$this._activeFrom = activeFrom;

  DateTime? _activeUntil;
  DateTime? get activeUntil => _$this._activeUntil;
  set activeUntil(DateTime? activeUntil) => _$this._activeUntil = activeUntil;

  int? _totalUsageLimit;
  int? get totalUsageLimit => _$this._totalUsageLimit;
  set totalUsageLimit(int? totalUsageLimit) =>
      _$this._totalUsageLimit = totalUsageLimit;

  int? _perCustomerUsageLimit;
  int? get perCustomerUsageLimit => _$this._perCustomerUsageLimit;
  set perCustomerUsageLimit(int? perCustomerUsageLimit) =>
      _$this._perCustomerUsageLimit = perCustomerUsageLimit;

  JsonObject? _branch;
  JsonObject? get branch => _$this._branch;
  set branch(JsonObject? branch) => _$this._branch = branch;

  JsonObject? _classType;
  JsonObject? get classType => _$this._classType;
  set classType(JsonObject? classType) => _$this._classType = classType;

  ListBuilder<String>? _packageIds;
  ListBuilder<String> get packageIds =>
      _$this._packageIds ??= ListBuilder<String>();
  set packageIds(ListBuilder<String>? packageIds) =>
      _$this._packageIds = packageIds;

  ListBuilder<VoucherPackagesInner>? _packages;
  ListBuilder<VoucherPackagesInner> get packages =>
      _$this._packages ??= ListBuilder<VoucherPackagesInner>();
  set packages(ListBuilder<VoucherPackagesInner>? packages) =>
      _$this._packages = packages;

  int? _redeemedCount;
  int? get redeemedCount => _$this._redeemedCount;
  set redeemedCount(int? redeemedCount) =>
      _$this._redeemedCount = redeemedCount;

  int? _version;
  int? get version => _$this._version;
  set version(int? version) => _$this._version = version;

  VoucherBuilder() {
    Voucher._defaults(this);
  }

  VoucherBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _id = $v.id;
      _code = $v.code;
      _name = $v.name;
      _description = $v.description;
      _status = $v.status;
      _discountType = $v.discountType;
      _discountValue = $v.discountValue;
      _maxDiscountRp = $v.maxDiscountRp;
      _minimumPurchaseRp = $v.minimumPurchaseRp;
      _activeFrom = $v.activeFrom;
      _activeUntil = $v.activeUntil;
      _totalUsageLimit = $v.totalUsageLimit;
      _perCustomerUsageLimit = $v.perCustomerUsageLimit;
      _branch = $v.branch;
      _classType = $v.classType;
      _packageIds = $v.packageIds?.toBuilder();
      _packages = $v.packages?.toBuilder();
      _redeemedCount = $v.redeemedCount;
      _version = $v.version;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(Voucher other) {
    _$v = other as _$Voucher;
  }

  @override
  void update(void Function(VoucherBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  Voucher build() => _build();

  _$Voucher _build() {
    _$Voucher _$result;
    try {
      _$result =
          _$v ??
          _$Voucher._(
            id: BuiltValueNullFieldError.checkNotNull(id, r'Voucher', 'id'),
            code: BuiltValueNullFieldError.checkNotNull(
              code,
              r'Voucher',
              'code',
            ),
            name: BuiltValueNullFieldError.checkNotNull(
              name,
              r'Voucher',
              'name',
            ),
            description: description,
            status: BuiltValueNullFieldError.checkNotNull(
              status,
              r'Voucher',
              'status',
            ),
            discountType: BuiltValueNullFieldError.checkNotNull(
              discountType,
              r'Voucher',
              'discountType',
            ),
            discountValue: BuiltValueNullFieldError.checkNotNull(
              discountValue,
              r'Voucher',
              'discountValue',
            ),
            maxDiscountRp: maxDiscountRp,
            minimumPurchaseRp: BuiltValueNullFieldError.checkNotNull(
              minimumPurchaseRp,
              r'Voucher',
              'minimumPurchaseRp',
            ),
            activeFrom: BuiltValueNullFieldError.checkNotNull(
              activeFrom,
              r'Voucher',
              'activeFrom',
            ),
            activeUntil: activeUntil,
            totalUsageLimit: totalUsageLimit,
            perCustomerUsageLimit: perCustomerUsageLimit,
            branch: branch,
            classType: classType,
            packageIds: _packageIds?.build(),
            packages: _packages?.build(),
            redeemedCount: redeemedCount,
            version: BuiltValueNullFieldError.checkNotNull(
              version,
              r'Voucher',
              'version',
            ),
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'packageIds';
        _packageIds?.build();
        _$failedField = 'packages';
        _packages?.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
          r'Voucher',
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
