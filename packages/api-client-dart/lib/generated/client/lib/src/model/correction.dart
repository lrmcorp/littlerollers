//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:openapi/src/model/money.dart';
import 'package:built_collection/built_collection.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'correction.g.dart';

/// Correction
///
/// Properties:
/// * [id] 
/// * [branchId] 
/// * [currentPeriod] 
/// * [referencePeriod] 
/// * [amount] 
/// * [reason] 
/// * [requestedBy] 
/// * [decidedBy] 
/// * [status] 
/// * [version] 
@BuiltValue()
abstract class Correction implements Built<Correction, CorrectionBuilder> {
  @BuiltValueField(wireName: r'id')
  String get id;

  @BuiltValueField(wireName: r'branchId')
  String get branchId;

  @BuiltValueField(wireName: r'currentPeriod')
  String get currentPeriod;

  @BuiltValueField(wireName: r'referencePeriod')
  String get referencePeriod;

  @BuiltValueField(wireName: r'amount')
  Money get amount;

  @BuiltValueField(wireName: r'reason')
  String get reason;

  @BuiltValueField(wireName: r'requestedBy')
  String get requestedBy;

  @BuiltValueField(wireName: r'decidedBy')
  String? get decidedBy;

  @BuiltValueField(wireName: r'status')
  CorrectionStatusEnum get status;
  // enum statusEnum {  PENDING,  APPROVED,  POSTED,  REJECTED,  };

  @BuiltValueField(wireName: r'version')
  int get version;

  Correction._();

  factory Correction([void updates(CorrectionBuilder b)]) = _$Correction;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(CorrectionBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<Correction> get serializer => _$CorrectionSerializer();
}

class _$CorrectionSerializer implements PrimitiveSerializer<Correction> {
  @override
  final Iterable<Type> types = const [Correction, _$Correction];

  @override
  final String wireName = r'Correction';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    Correction object, {
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
    yield r'currentPeriod';
    yield serializers.serialize(
      object.currentPeriod,
      specifiedType: const FullType(String),
    );
    yield r'referencePeriod';
    yield serializers.serialize(
      object.referencePeriod,
      specifiedType: const FullType(String),
    );
    yield r'amount';
    yield serializers.serialize(
      object.amount,
      specifiedType: const FullType(Money),
    );
    yield r'reason';
    yield serializers.serialize(
      object.reason,
      specifiedType: const FullType(String),
    );
    yield r'requestedBy';
    yield serializers.serialize(
      object.requestedBy,
      specifiedType: const FullType(String),
    );
    if (object.decidedBy != null) {
      yield r'decidedBy';
      yield serializers.serialize(
        object.decidedBy,
        specifiedType: const FullType.nullable(String),
      );
    }
    yield r'status';
    yield serializers.serialize(
      object.status,
      specifiedType: const FullType(CorrectionStatusEnum),
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
    Correction object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required CorrectionBuilder result,
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
        case r'currentPeriod':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.currentPeriod = valueDes;
          break;
        case r'referencePeriod':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.referencePeriod = valueDes;
          break;
        case r'amount':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(Money),
          ) as Money;
          result.amount.replace(valueDes);
          break;
        case r'reason':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.reason = valueDes;
          break;
        case r'requestedBy':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.requestedBy = valueDes;
          break;
        case r'decidedBy':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.decidedBy = valueDes;
          break;
        case r'status':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(CorrectionStatusEnum),
          ) as CorrectionStatusEnum;
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
  Correction deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = CorrectionBuilder();
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

class CorrectionStatusEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'PENDING')
  static const CorrectionStatusEnum PENDING = _$correctionStatusEnum_PENDING;
  @BuiltValueEnumConst(wireName: r'APPROVED')
  static const CorrectionStatusEnum APPROVED = _$correctionStatusEnum_APPROVED;
  @BuiltValueEnumConst(wireName: r'POSTED')
  static const CorrectionStatusEnum POSTED = _$correctionStatusEnum_POSTED;
  @BuiltValueEnumConst(wireName: r'REJECTED')
  static const CorrectionStatusEnum REJECTED = _$correctionStatusEnum_REJECTED;

  static Serializer<CorrectionStatusEnum> get serializer => _$correctionStatusEnumSerializer;

  const CorrectionStatusEnum._(String name): super(name);

  static BuiltSet<CorrectionStatusEnum> get values => _$correctionStatusEnumValues;
  static CorrectionStatusEnum valueOf(String name) => _$correctionStatusEnumValueOf(name);
}

