// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'voucher_command.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

const VoucherCommandDiscountTypeEnum
_$voucherCommandDiscountTypeEnum_PERCENTAGE =
    const VoucherCommandDiscountTypeEnum._('PERCENTAGE');
const VoucherCommandDiscountTypeEnum
_$voucherCommandDiscountTypeEnum_FIXED_AMOUNT =
    const VoucherCommandDiscountTypeEnum._('FIXED_AMOUNT');

VoucherCommandDiscountTypeEnum _$voucherCommandDiscountTypeEnumValueOf(
  String name,
) {
  switch (name) {
    case 'PERCENTAGE':
      return _$voucherCommandDiscountTypeEnum_PERCENTAGE;
    case 'FIXED_AMOUNT':
      return _$voucherCommandDiscountTypeEnum_FIXED_AMOUNT;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<VoucherCommandDiscountTypeEnum>
_$voucherCommandDiscountTypeEnumValues =
    BuiltSet<VoucherCommandDiscountTypeEnum>(
      const <VoucherCommandDiscountTypeEnum>[
        _$voucherCommandDiscountTypeEnum_PERCENTAGE,
        _$voucherCommandDiscountTypeEnum_FIXED_AMOUNT,
      ],
    );

Serializer<VoucherCommandDiscountTypeEnum>
_$voucherCommandDiscountTypeEnumSerializer =
    _$VoucherCommandDiscountTypeEnumSerializer();

class _$VoucherCommandDiscountTypeEnumSerializer
    implements PrimitiveSerializer<VoucherCommandDiscountTypeEnum> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'PERCENTAGE': 'PERCENTAGE',
    'FIXED_AMOUNT': 'FIXED_AMOUNT',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'PERCENTAGE': 'PERCENTAGE',
    'FIXED_AMOUNT': 'FIXED_AMOUNT',
  };

  @override
  final Iterable<Type> types = const <Type>[VoucherCommandDiscountTypeEnum];
  @override
  final String wireName = 'VoucherCommandDiscountTypeEnum';

  @override
  Object serialize(
    Serializers serializers,
    VoucherCommandDiscountTypeEnum object, {
    FullType specifiedType = FullType.unspecified,
  }) => _toWire[object.name] ?? object.name;

  @override
  VoucherCommandDiscountTypeEnum deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) => VoucherCommandDiscountTypeEnum.valueOf(
    _fromWire[serialized] ?? (serialized is String ? serialized : ''),
  );
}

abstract mixin class VoucherCommandBuilder {
  void replace(VoucherCommand other);
  void update(void Function(VoucherCommandBuilder) updates);
  String? get code;
  set code(String? code);

  String? get name;
  set name(String? name);

  String? get description;
  set description(String? description);

  VoucherCommandDiscountTypeEnum? get discountType;
  set discountType(VoucherCommandDiscountTypeEnum? discountType);

  int? get discountValue;
  set discountValue(int? discountValue);

  int? get maxDiscountRp;
  set maxDiscountRp(int? maxDiscountRp);

  int? get minimumPurchaseRp;
  set minimumPurchaseRp(int? minimumPurchaseRp);

  DateTime? get activeFrom;
  set activeFrom(DateTime? activeFrom);

  DateTime? get activeUntil;
  set activeUntil(DateTime? activeUntil);

  int? get totalUsageLimit;
  set totalUsageLimit(int? totalUsageLimit);

  int? get perCustomerUsageLimit;
  set perCustomerUsageLimit(int? perCustomerUsageLimit);

  String? get branchId;
  set branchId(String? branchId);

  String? get classTypeId;
  set classTypeId(String? classTypeId);

  SetBuilder<String> get packageIds;
  set packageIds(SetBuilder<String>? packageIds);

  String? get reason;
  set reason(String? reason);
}

class _$$VoucherCommand extends $VoucherCommand {
  @override
  final String code;
  @override
  final String name;
  @override
  final String? description;
  @override
  final VoucherCommandDiscountTypeEnum discountType;
  @override
  final int discountValue;
  @override
  final int? maxDiscountRp;
  @override
  final int? minimumPurchaseRp;
  @override
  final DateTime activeFrom;
  @override
  final DateTime? activeUntil;
  @override
  final int? totalUsageLimit;
  @override
  final int? perCustomerUsageLimit;
  @override
  final String? branchId;
  @override
  final String? classTypeId;
  @override
  final BuiltSet<String>? packageIds;
  @override
  final String reason;

  factory _$$VoucherCommand([void Function($VoucherCommandBuilder)? updates]) =>
      ($VoucherCommandBuilder()..update(updates))._build();

  _$$VoucherCommand._({
    required this.code,
    required this.name,
    this.description,
    required this.discountType,
    required this.discountValue,
    this.maxDiscountRp,
    this.minimumPurchaseRp,
    required this.activeFrom,
    this.activeUntil,
    this.totalUsageLimit,
    this.perCustomerUsageLimit,
    this.branchId,
    this.classTypeId,
    this.packageIds,
    required this.reason,
  }) : super._();
  @override
  $VoucherCommand rebuild(void Function($VoucherCommandBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  $VoucherCommandBuilder toBuilder() => $VoucherCommandBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is $VoucherCommand &&
        code == other.code &&
        name == other.name &&
        description == other.description &&
        discountType == other.discountType &&
        discountValue == other.discountValue &&
        maxDiscountRp == other.maxDiscountRp &&
        minimumPurchaseRp == other.minimumPurchaseRp &&
        activeFrom == other.activeFrom &&
        activeUntil == other.activeUntil &&
        totalUsageLimit == other.totalUsageLimit &&
        perCustomerUsageLimit == other.perCustomerUsageLimit &&
        branchId == other.branchId &&
        classTypeId == other.classTypeId &&
        packageIds == other.packageIds &&
        reason == other.reason;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, code.hashCode);
    _$hash = $jc(_$hash, name.hashCode);
    _$hash = $jc(_$hash, description.hashCode);
    _$hash = $jc(_$hash, discountType.hashCode);
    _$hash = $jc(_$hash, discountValue.hashCode);
    _$hash = $jc(_$hash, maxDiscountRp.hashCode);
    _$hash = $jc(_$hash, minimumPurchaseRp.hashCode);
    _$hash = $jc(_$hash, activeFrom.hashCode);
    _$hash = $jc(_$hash, activeUntil.hashCode);
    _$hash = $jc(_$hash, totalUsageLimit.hashCode);
    _$hash = $jc(_$hash, perCustomerUsageLimit.hashCode);
    _$hash = $jc(_$hash, branchId.hashCode);
    _$hash = $jc(_$hash, classTypeId.hashCode);
    _$hash = $jc(_$hash, packageIds.hashCode);
    _$hash = $jc(_$hash, reason.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'$VoucherCommand')
          ..add('code', code)
          ..add('name', name)
          ..add('description', description)
          ..add('discountType', discountType)
          ..add('discountValue', discountValue)
          ..add('maxDiscountRp', maxDiscountRp)
          ..add('minimumPurchaseRp', minimumPurchaseRp)
          ..add('activeFrom', activeFrom)
          ..add('activeUntil', activeUntil)
          ..add('totalUsageLimit', totalUsageLimit)
          ..add('perCustomerUsageLimit', perCustomerUsageLimit)
          ..add('branchId', branchId)
          ..add('classTypeId', classTypeId)
          ..add('packageIds', packageIds)
          ..add('reason', reason))
        .toString();
  }
}

class $VoucherCommandBuilder
    implements
        Builder<$VoucherCommand, $VoucherCommandBuilder>,
        VoucherCommandBuilder {
  _$$VoucherCommand? _$v;

  String? _code;
  String? get code => _$this._code;
  set code(covariant String? code) => _$this._code = code;

  String? _name;
  String? get name => _$this._name;
  set name(covariant String? name) => _$this._name = name;

  String? _description;
  String? get description => _$this._description;
  set description(covariant String? description) =>
      _$this._description = description;

  VoucherCommandDiscountTypeEnum? _discountType;
  VoucherCommandDiscountTypeEnum? get discountType => _$this._discountType;
  set discountType(covariant VoucherCommandDiscountTypeEnum? discountType) =>
      _$this._discountType = discountType;

  int? _discountValue;
  int? get discountValue => _$this._discountValue;
  set discountValue(covariant int? discountValue) =>
      _$this._discountValue = discountValue;

  int? _maxDiscountRp;
  int? get maxDiscountRp => _$this._maxDiscountRp;
  set maxDiscountRp(covariant int? maxDiscountRp) =>
      _$this._maxDiscountRp = maxDiscountRp;

  int? _minimumPurchaseRp;
  int? get minimumPurchaseRp => _$this._minimumPurchaseRp;
  set minimumPurchaseRp(covariant int? minimumPurchaseRp) =>
      _$this._minimumPurchaseRp = minimumPurchaseRp;

  DateTime? _activeFrom;
  DateTime? get activeFrom => _$this._activeFrom;
  set activeFrom(covariant DateTime? activeFrom) =>
      _$this._activeFrom = activeFrom;

  DateTime? _activeUntil;
  DateTime? get activeUntil => _$this._activeUntil;
  set activeUntil(covariant DateTime? activeUntil) =>
      _$this._activeUntil = activeUntil;

  int? _totalUsageLimit;
  int? get totalUsageLimit => _$this._totalUsageLimit;
  set totalUsageLimit(covariant int? totalUsageLimit) =>
      _$this._totalUsageLimit = totalUsageLimit;

  int? _perCustomerUsageLimit;
  int? get perCustomerUsageLimit => _$this._perCustomerUsageLimit;
  set perCustomerUsageLimit(covariant int? perCustomerUsageLimit) =>
      _$this._perCustomerUsageLimit = perCustomerUsageLimit;

  String? _branchId;
  String? get branchId => _$this._branchId;
  set branchId(covariant String? branchId) => _$this._branchId = branchId;

  String? _classTypeId;
  String? get classTypeId => _$this._classTypeId;
  set classTypeId(covariant String? classTypeId) =>
      _$this._classTypeId = classTypeId;

  SetBuilder<String>? _packageIds;
  SetBuilder<String> get packageIds =>
      _$this._packageIds ??= SetBuilder<String>();
  set packageIds(covariant SetBuilder<String>? packageIds) =>
      _$this._packageIds = packageIds;

  String? _reason;
  String? get reason => _$this._reason;
  set reason(covariant String? reason) => _$this._reason = reason;

  $VoucherCommandBuilder() {
    $VoucherCommand._defaults(this);
  }

  $VoucherCommandBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _code = $v.code;
      _name = $v.name;
      _description = $v.description;
      _discountType = $v.discountType;
      _discountValue = $v.discountValue;
      _maxDiscountRp = $v.maxDiscountRp;
      _minimumPurchaseRp = $v.minimumPurchaseRp;
      _activeFrom = $v.activeFrom;
      _activeUntil = $v.activeUntil;
      _totalUsageLimit = $v.totalUsageLimit;
      _perCustomerUsageLimit = $v.perCustomerUsageLimit;
      _branchId = $v.branchId;
      _classTypeId = $v.classTypeId;
      _packageIds = $v.packageIds?.toBuilder();
      _reason = $v.reason;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(covariant $VoucherCommand other) {
    _$v = other as _$$VoucherCommand;
  }

  @override
  void update(void Function($VoucherCommandBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  $VoucherCommand build() => _build();

  _$$VoucherCommand _build() {
    _$$VoucherCommand _$result;
    try {
      _$result =
          _$v ??
          _$$VoucherCommand._(
            code: BuiltValueNullFieldError.checkNotNull(
              code,
              r'$VoucherCommand',
              'code',
            ),
            name: BuiltValueNullFieldError.checkNotNull(
              name,
              r'$VoucherCommand',
              'name',
            ),
            description: description,
            discountType: BuiltValueNullFieldError.checkNotNull(
              discountType,
              r'$VoucherCommand',
              'discountType',
            ),
            discountValue: BuiltValueNullFieldError.checkNotNull(
              discountValue,
              r'$VoucherCommand',
              'discountValue',
            ),
            maxDiscountRp: maxDiscountRp,
            minimumPurchaseRp: minimumPurchaseRp,
            activeFrom: BuiltValueNullFieldError.checkNotNull(
              activeFrom,
              r'$VoucherCommand',
              'activeFrom',
            ),
            activeUntil: activeUntil,
            totalUsageLimit: totalUsageLimit,
            perCustomerUsageLimit: perCustomerUsageLimit,
            branchId: branchId,
            classTypeId: classTypeId,
            packageIds: _packageIds?.build(),
            reason: BuiltValueNullFieldError.checkNotNull(
              reason,
              r'$VoucherCommand',
              'reason',
            ),
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'packageIds';
        _packageIds?.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
          r'$VoucherCommand',
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
