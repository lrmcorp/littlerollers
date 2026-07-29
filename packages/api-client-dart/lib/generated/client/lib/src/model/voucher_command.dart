//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'voucher_command.g.dart';

/// VoucherCommand
///
/// Properties:
/// * [code] 
/// * [name] 
/// * [description] 
/// * [discountType] 
/// * [discountValue] 
/// * [maxDiscountRp] 
/// * [minimumPurchaseRp] 
/// * [activeFrom] 
/// * [activeUntil] 
/// * [totalUsageLimit] 
/// * [perCustomerUsageLimit] 
/// * [branchId] 
/// * [classTypeId] 
/// * [packageIds] 
@BuiltValue(instantiable: false)
abstract class VoucherCommand  {
  @BuiltValueField(wireName: r'code')
  String get code;

  @BuiltValueField(wireName: r'name')
  String get name;

  @BuiltValueField(wireName: r'description')
  String? get description;

  @BuiltValueField(wireName: r'discountType')
  VoucherCommandDiscountTypeEnum get discountType;
  // enum discountTypeEnum {  PERCENTAGE,  FIXED_AMOUNT,  };

  @BuiltValueField(wireName: r'discountValue')
  int get discountValue;

  @BuiltValueField(wireName: r'maxDiscountRp')
  int? get maxDiscountRp;

  @BuiltValueField(wireName: r'minimumPurchaseRp')
  int? get minimumPurchaseRp;

  @BuiltValueField(wireName: r'activeFrom')
  DateTime get activeFrom;

  @BuiltValueField(wireName: r'activeUntil')
  DateTime? get activeUntil;

  @BuiltValueField(wireName: r'totalUsageLimit')
  int? get totalUsageLimit;

  @BuiltValueField(wireName: r'perCustomerUsageLimit')
  int? get perCustomerUsageLimit;

  @BuiltValueField(wireName: r'branchId')
  String? get branchId;

  @BuiltValueField(wireName: r'classTypeId')
  String? get classTypeId;

  @BuiltValueField(wireName: r'packageIds')
  BuiltList<String>? get packageIds;

  @BuiltValueSerializer(custom: true)
  static Serializer<VoucherCommand> get serializer => _$VoucherCommandSerializer();
}

class _$VoucherCommandSerializer implements PrimitiveSerializer<VoucherCommand> {
  @override
  final Iterable<Type> types = const [VoucherCommand];

  @override
  final String wireName = r'VoucherCommand';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    VoucherCommand object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
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
        specifiedType: const FullType(String),
      );
    }
    yield r'discountType';
    yield serializers.serialize(
      object.discountType,
      specifiedType: const FullType(VoucherCommandDiscountTypeEnum),
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
    if (object.minimumPurchaseRp != null) {
      yield r'minimumPurchaseRp';
      yield serializers.serialize(
        object.minimumPurchaseRp,
        specifiedType: const FullType(int),
      );
    }
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
    if (object.branchId != null) {
      yield r'branchId';
      yield serializers.serialize(
        object.branchId,
        specifiedType: const FullType(String),
      );
    }
    if (object.classTypeId != null) {
      yield r'classTypeId';
      yield serializers.serialize(
        object.classTypeId,
        specifiedType: const FullType(String),
      );
    }
    if (object.packageIds != null) {
      yield r'packageIds';
      yield serializers.serialize(
        object.packageIds,
        specifiedType: const FullType(BuiltList, [FullType(String)]),
      );
    }
  }

  @override
  Object serialize(
    Serializers serializers,
    VoucherCommand object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  @override
  VoucherCommand deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return serializers.deserialize(serialized, specifiedType: FullType($VoucherCommand)) as $VoucherCommand;
  }
}

/// a concrete implementation of [VoucherCommand], since [VoucherCommand] is not instantiable
@BuiltValue(instantiable: true)
abstract class $VoucherCommand implements VoucherCommand, Built<$VoucherCommand, $VoucherCommandBuilder> {
  $VoucherCommand._();

  factory $VoucherCommand([void Function($VoucherCommandBuilder)? updates]) = _$$VoucherCommand;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults($VoucherCommandBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<$VoucherCommand> get serializer => _$$VoucherCommandSerializer();
}

class _$$VoucherCommandSerializer implements PrimitiveSerializer<$VoucherCommand> {
  @override
  final Iterable<Type> types = const [$VoucherCommand, _$$VoucherCommand];

  @override
  final String wireName = r'$VoucherCommand';

  @override
  Object serialize(
    Serializers serializers,
    $VoucherCommand object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return serializers.serialize(object, specifiedType: FullType(VoucherCommand))!;
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required VoucherCommandBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
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
            specifiedType: const FullType(String),
          ) as String;
          result.description = valueDes;
          break;
        case r'discountType':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(VoucherCommandDiscountTypeEnum),
          ) as VoucherCommandDiscountTypeEnum;
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
        case r'branchId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.branchId = valueDes;
          break;
        case r'classTypeId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.classTypeId = valueDes;
          break;
        case r'packageIds':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(String)]),
          ) as BuiltList<String>;
          result.packageIds.replace(valueDes);
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  $VoucherCommand deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = $VoucherCommandBuilder();
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

class VoucherCommandDiscountTypeEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'PERCENTAGE')
  static const VoucherCommandDiscountTypeEnum PERCENTAGE = _$voucherCommandDiscountTypeEnum_PERCENTAGE;
  @BuiltValueEnumConst(wireName: r'FIXED_AMOUNT')
  static const VoucherCommandDiscountTypeEnum FIXED_AMOUNT = _$voucherCommandDiscountTypeEnum_FIXED_AMOUNT;

  static Serializer<VoucherCommandDiscountTypeEnum> get serializer => _$voucherCommandDiscountTypeEnumSerializer;

  const VoucherCommandDiscountTypeEnum._(String name): super(name);

  static BuiltSet<VoucherCommandDiscountTypeEnum> get values => _$voucherCommandDiscountTypeEnumValues;
  static VoucherCommandDiscountTypeEnum valueOf(String name) => _$voucherCommandDiscountTypeEnumValueOf(name);
}

