//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:openapi/src/model/money.dart';
import 'package:built_collection/built_collection.dart';
import 'package:openapi/src/model/date.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'other_cost.g.dart';

/// OtherCost
///
/// Properties:
/// * [id] 
/// * [branchId] 
/// * [period] 
/// * [occurredOn] 
/// * [categoryCode] 
/// * [description] 
/// * [reason] 
/// * [amount] 
/// * [evidenceUploadId] 
/// * [status] 
/// * [version] 
@BuiltValue()
abstract class OtherCost implements Built<OtherCost, OtherCostBuilder> {
  @BuiltValueField(wireName: r'id')
  String get id;

  @BuiltValueField(wireName: r'branchId')
  String get branchId;

  @BuiltValueField(wireName: r'period')
  String get period;

  @BuiltValueField(wireName: r'occurredOn')
  Date get occurredOn;

  @BuiltValueField(wireName: r'categoryCode')
  String get categoryCode;

  @BuiltValueField(wireName: r'description')
  String get description;

  @BuiltValueField(wireName: r'reason')
  String get reason;

  @BuiltValueField(wireName: r'amount')
  Money get amount;

  @BuiltValueField(wireName: r'evidenceUploadId')
  String? get evidenceUploadId;

  @BuiltValueField(wireName: r'status')
  OtherCostStatusEnum get status;
  // enum statusEnum {  ACTIVE,  REVERSED,  };

  @BuiltValueField(wireName: r'version')
  int get version;

  OtherCost._();

  factory OtherCost([void updates(OtherCostBuilder b)]) = _$OtherCost;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(OtherCostBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<OtherCost> get serializer => _$OtherCostSerializer();
}

class _$OtherCostSerializer implements PrimitiveSerializer<OtherCost> {
  @override
  final Iterable<Type> types = const [OtherCost, _$OtherCost];

  @override
  final String wireName = r'OtherCost';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    OtherCost object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'id';
    yield serializers.serialize(
      object.id,
      specifiedType: const FullType(String),
    );
    yield r'branchId';
    yield serializers.serialize(
      object.branchId,
      specifiedType: const FullType(String),
    );
    yield r'period';
    yield serializers.serialize(
      object.period,
      specifiedType: const FullType(String),
    );
    yield r'occurredOn';
    yield serializers.serialize(
      object.occurredOn,
      specifiedType: const FullType(Date),
    );
    yield r'categoryCode';
    yield serializers.serialize(
      object.categoryCode,
      specifiedType: const FullType(String),
    );
    yield r'description';
    yield serializers.serialize(
      object.description,
      specifiedType: const FullType(String),
    );
    yield r'reason';
    yield serializers.serialize(
      object.reason,
      specifiedType: const FullType(String),
    );
    yield r'amount';
    yield serializers.serialize(
      object.amount,
      specifiedType: const FullType(Money),
    );
    if (object.evidenceUploadId != null) {
      yield r'evidenceUploadId';
      yield serializers.serialize(
        object.evidenceUploadId,
        specifiedType: const FullType.nullable(String),
      );
    }
    yield r'status';
    yield serializers.serialize(
      object.status,
      specifiedType: const FullType(OtherCostStatusEnum),
    );
    yield r'version';
    yield serializers.serialize(
      object.version,
      specifiedType: const FullType(int),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    OtherCost object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required OtherCostBuilder result,
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
        case r'branchId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.branchId = valueDes;
          break;
        case r'period':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.period = valueDes;
          break;
        case r'occurredOn':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(Date),
          ) as Date;
          result.occurredOn = valueDes;
          break;
        case r'categoryCode':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.categoryCode = valueDes;
          break;
        case r'description':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.description = valueDes;
          break;
        case r'reason':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.reason = valueDes;
          break;
        case r'amount':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(Money),
          ) as Money;
          result.amount.replace(valueDes);
          break;
        case r'evidenceUploadId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.evidenceUploadId = valueDes;
          break;
        case r'status':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(OtherCostStatusEnum),
          ) as OtherCostStatusEnum;
          result.status = valueDes;
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
  OtherCost deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = OtherCostBuilder();
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

class OtherCostStatusEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'ACTIVE')
  static const OtherCostStatusEnum ACTIVE = _$otherCostStatusEnum_ACTIVE;
  @BuiltValueEnumConst(wireName: r'REVERSED')
  static const OtherCostStatusEnum REVERSED = _$otherCostStatusEnum_REVERSED;

  static Serializer<OtherCostStatusEnum> get serializer => _$otherCostStatusEnumSerializer;

  const OtherCostStatusEnum._(String name): super(name);

  static BuiltSet<OtherCostStatusEnum> get values => _$otherCostStatusEnumValues;
  static OtherCostStatusEnum valueOf(String name) => _$otherCostStatusEnumValueOf(name);
}

