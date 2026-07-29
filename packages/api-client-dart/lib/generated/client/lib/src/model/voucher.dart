//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:built_value/json_object.dart';
import 'package:openapi/src/model/voucher_packages_inner.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'voucher.g.dart';

/// Voucher
///
/// Properties:
/// * [id] 
/// * [code] 
/// * [name] 
/// * [description] 
/// * [status] 
/// * [discountType] 
/// * [discountValue] 
/// * [maxDiscountRp] 
/// * [minimumPurchaseRp] 
/// * [activeFrom] 
/// * [activeUntil] 
/// * [totalUsageLimit] 
/// * [perCustomerUsageLimit] 
/// * [branch] 
/// * [classType] 
/// * [packageIds] 
/// * [packages] 
/// * [redeemedCount] 
/// * [version] 
@BuiltValue()
abstract class Voucher implements Built<Voucher, VoucherBuilder> {
  @BuiltValueField(wireName: r'id')
  String get id;

  @BuiltValueField(wireName: r'code')
  String get code;

  @BuiltValueField(wireName: r'name')
  String get name;

  @BuiltValueField(wireName: r'description')
  String? get description;

  @BuiltValueField(wireName: r'status')
  VoucherStatusEnum get status;
  // enum statusEnum {  DRAFT,  ACTIVE,  PAUSED,  EXPIRED,  EXHAUSTED,  ARCHIVED,  };

  @BuiltValueField(wireName: r'discountType')
  VoucherDiscountTypeEnum get discountType;
  // enum discountTypeEnum {  PERCENTAGE,  FIXED_AMOUNT,  };

  @BuiltValueField(wireName: r'discountValue')
  int get discountValue;

  @BuiltValueField(wireName: r'maxDiscountRp')
  int? get maxDiscountRp;

  @BuiltValueField(wireName: r'minimumPurchaseRp')
  int get minimumPurchaseRp;

  @BuiltValueField(wireName: r'activeFrom')
  DateTime get activeFrom;

  @BuiltValueField(wireName: r'activeUntil')
  DateTime? get activeUntil;

  @BuiltValueField(wireName: r'totalUsageLimit')
  int? get totalUsageLimit;

  @BuiltValueField(wireName: r'perCustomerUsageLimit')
  int? get perCustomerUsageLimit;

  @BuiltValueField(wireName: r'branch')
  JsonObject? get branch;

  @BuiltValueField(wireName: r'classType')
  JsonObject? get classType;

  @BuiltValueField(wireName: r'packageIds')
  BuiltList<String>? get packageIds;

  @BuiltValueField(wireName: r'packages')
  BuiltList<VoucherPackagesInner>? get packages;

  @BuiltValueField(wireName: r'redeemedCount')
  int? get redeemedCount;

  @BuiltValueField(wireName: r'version')
  int get version;

  Voucher._();

  factory Voucher([void updates(VoucherBuilder b)]) = _$Voucher;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(VoucherBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<Voucher> get serializer => _$VoucherSerializer();
}

class _$VoucherSerializer implements PrimitiveSerializer<Voucher> {
  @override
  final Iterable<Type> types = const [Voucher, _$Voucher];

  @override
  final String wireName = r'Voucher';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    Voucher object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'id';
    yield serializers.serialize(
      object.id,
      specifiedType: const FullType(String),
    );
    yield r'code';
    yield serializers.serialize(
      object.code,
      specifiedType: const FullType(String),
    );
    yield r'name';
    yield serializers.serialize(
      object.name,
      specifiedType: const FullType(String),
    );
    if (object.description != null) {
      yield r'description';
      yield serializers.serialize(
        object.description,
        specifiedType: const FullType.nullable(String),
      );
    }
    yield r'status';
    yield serializers.serialize(
      object.status,
      specifiedType: const FullType(VoucherStatusEnum),
    );
    yield r'discountType';
    yield serializers.serialize(
      object.discountType,
      specifiedType: const FullType(VoucherDiscountTypeEnum),
    );
    yield r'discountValue';
    yield serializers.serialize(
      object.discountValue,
      specifiedType: const FullType(int),
    );
    if (object.maxDiscountRp != null) {
      yield r'maxDiscountRp';
      yield serializers.serialize(
        object.maxDiscountRp,
        specifiedType: const FullType.nullable(int),
      );
    }
    yield r'minimumPurchaseRp';
    yield serializers.serialize(
      object.minimumPurchaseRp,
      specifiedType: const FullType(int),
    );
    yield r'activeFrom';
    yield serializers.serialize(
      object.activeFrom,
      specifiedType: const FullType(DateTime),
    );
    if (object.activeUntil != null) {
      yield r'activeUntil';
      yield serializers.serialize(
        object.activeUntil,
        specifiedType: const FullType.nullable(DateTime),
      );
    }
    if (object.totalUsageLimit != null) {
      yield r'totalUsageLimit';
      yield serializers.serialize(
        object.totalUsageLimit,
        specifiedType: const FullType.nullable(int),
      );
    }
    if (object.perCustomerUsageLimit != null) {
      yield r'perCustomerUsageLimit';
      yield serializers.serialize(
        object.perCustomerUsageLimit,
        specifiedType: const FullType.nullable(int),
      );
    }
    if (object.branch != null) {
      yield r'branch';
      yield serializers.serialize(
        object.branch,
        specifiedType: const FullType.nullable(JsonObject),
      );
    }
    if (object.classType != null) {
      yield r'classType';
      yield serializers.serialize(
        object.classType,
        specifiedType: const FullType.nullable(JsonObject),
      );
    }
    if (object.packageIds != null) {
      yield r'packageIds';
      yield serializers.serialize(
        object.packageIds,
        specifiedType: const FullType(BuiltList, [FullType(String)]),
      );
    }
    if (object.packages != null) {
      yield r'packages';
      yield serializers.serialize(
        object.packages,
        specifiedType: const FullType(BuiltList, [FullType(VoucherPackagesInner)]),
      );
    }
    if (object.redeemedCount != null) {
      yield r'redeemedCount';
      yield serializers.serialize(
        object.redeemedCount,
        specifiedType: const FullType(int),
      );
    }
    yield r'version';
    yield serializers.serialize(
      object.version,
      specifiedType: const FullType(int),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    Voucher object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required VoucherBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'id':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.id = valueDes;
          break;
        case r'code':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.code = valueDes;
          break;
        case r'name':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.name = valueDes;
          break;
        case r'description':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.description = valueDes;
          break;
        case r'status':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(VoucherStatusEnum),
          ) as VoucherStatusEnum;
          result.status = valueDes;
          break;
        case r'discountType':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(VoucherDiscountTypeEnum),
          ) as VoucherDiscountTypeEnum;
          result.discountType = valueDes;
          break;
        case r'discountValue':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.discountValue = valueDes;
          break;
        case r'maxDiscountRp':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(int),
          ) as int?;
          if (valueDes == null) continue;
          result.maxDiscountRp = valueDes;
          break;
        case r'minimumPurchaseRp':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.minimumPurchaseRp = valueDes;
          break;
        case r'activeFrom':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(DateTime),
          ) as DateTime;
          result.activeFrom = valueDes;
          break;
        case r'activeUntil':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(DateTime),
          ) as DateTime?;
          if (valueDes == null) continue;
          result.activeUntil = valueDes;
          break;
        case r'totalUsageLimit':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(int),
          ) as int?;
          if (valueDes == null) continue;
          result.totalUsageLimit = valueDes;
          break;
        case r'perCustomerUsageLimit':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(int),
          ) as int?;
          if (valueDes == null) continue;
          result.perCustomerUsageLimit = valueDes;
          break;
        case r'branch':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(JsonObject),
          ) as JsonObject?;
          if (valueDes == null) continue;
          result.branch = valueDes;
          break;
        case r'classType':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(JsonObject),
          ) as JsonObject?;
          if (valueDes == null) continue;
          result.classType = valueDes;
          break;
        case r'packageIds':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(String)]),
          ) as BuiltList<String>;
          result.packageIds.replace(valueDes);
          break;
        case r'packages':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(VoucherPackagesInner)]),
          ) as BuiltList<VoucherPackagesInner>;
          result.packages.replace(valueDes);
          break;
        case r'redeemedCount':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.redeemedCount = valueDes;
          break;
        case r'version':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.version = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  Voucher deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = VoucherBuilder();
    final serializedList = (serialized as Iterable<Object?>).toList();
    final unhandled = <Object?>[];
    _deserializeProperties(
      serializers,
      serialized,
      specifiedType: specifiedType,
      serializedList: serializedList,
      unhandled: unhandled,
      result: result,
    );
    return result.build();
  }
}

class VoucherStatusEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'DRAFT')
  static const VoucherStatusEnum DRAFT = _$voucherStatusEnum_DRAFT;
  @BuiltValueEnumConst(wireName: r'ACTIVE')
  static const VoucherStatusEnum ACTIVE = _$voucherStatusEnum_ACTIVE;
  @BuiltValueEnumConst(wireName: r'PAUSED')
  static const VoucherStatusEnum PAUSED = _$voucherStatusEnum_PAUSED;
  @BuiltValueEnumConst(wireName: r'EXPIRED')
  static const VoucherStatusEnum EXPIRED = _$voucherStatusEnum_EXPIRED;
  @BuiltValueEnumConst(wireName: r'EXHAUSTED')
  static const VoucherStatusEnum EXHAUSTED = _$voucherStatusEnum_EXHAUSTED;
  @BuiltValueEnumConst(wireName: r'ARCHIVED')
  static const VoucherStatusEnum ARCHIVED = _$voucherStatusEnum_ARCHIVED;

  static Serializer<VoucherStatusEnum> get serializer => _$voucherStatusEnumSerializer;

  const VoucherStatusEnum._(String name): super(name);

  static BuiltSet<VoucherStatusEnum> get values => _$voucherStatusEnumValues;
  static VoucherStatusEnum valueOf(String name) => _$voucherStatusEnumValueOf(name);
}

class VoucherDiscountTypeEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'PERCENTAGE')
  static const VoucherDiscountTypeEnum PERCENTAGE = _$voucherDiscountTypeEnum_PERCENTAGE;
  @BuiltValueEnumConst(wireName: r'FIXED_AMOUNT')
  static const VoucherDiscountTypeEnum FIXED_AMOUNT = _$voucherDiscountTypeEnum_FIXED_AMOUNT;

  static Serializer<VoucherDiscountTypeEnum> get serializer => _$voucherDiscountTypeEnumSerializer;

  const VoucherDiscountTypeEnum._(String name): super(name);

  static BuiltSet<VoucherDiscountTypeEnum> get values => _$voucherDiscountTypeEnumValues;
  static VoucherDiscountTypeEnum valueOf(String name) => _$voucherDiscountTypeEnumValueOf(name);
}

