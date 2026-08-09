//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:openapi/src/model/date.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'other_cost_command.g.dart';

/// OtherCostCommand
///
/// Properties:
/// * [branchId] 
/// * [period] 
/// * [occurredOn] 
/// * [categoryCode] 
/// * [description] 
/// * [reason] 
/// * [amountRp] 
/// * [evidenceUploadId] 
@BuiltValue()
abstract class OtherCostCommand implements Built<OtherCostCommand, OtherCostCommandBuilder> {
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

  @BuiltValueField(wireName: r'amountRp')
  int get amountRp;

  @BuiltValueField(wireName: r'evidenceUploadId')
  String? get evidenceUploadId;

  OtherCostCommand._();

  factory OtherCostCommand([void updates(OtherCostCommandBuilder b)]) = _$OtherCostCommand;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(OtherCostCommandBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<OtherCostCommand> get serializer => _$OtherCostCommandSerializer();
}

class _$OtherCostCommandSerializer implements PrimitiveSerializer<OtherCostCommand> {
  @override
  final Iterable<Type> types = const [OtherCostCommand, _$OtherCostCommand];

  @override
  final String wireName = r'OtherCostCommand';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    OtherCostCommand object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
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
    yield r'amountRp';
    yield serializers.serialize(
      object.amountRp,
      specifiedType: const FullType(int),
    );
    if (object.evidenceUploadId != null) {
      yield r'evidenceUploadId';
      yield serializers.serialize(
        object.evidenceUploadId,
        specifiedType: const FullType(String),
      );
    }
  }

  @override
  Object serialize(
    Serializers serializers,
    OtherCostCommand object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required OtherCostCommandBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
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
        case r'amountRp':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.amountRp = valueDes;
          break;
        case r'evidenceUploadId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.evidenceUploadId = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  OtherCostCommand deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = OtherCostCommandBuilder();
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

