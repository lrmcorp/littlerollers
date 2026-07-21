//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'adjustment_command.g.dart';

/// AdjustmentCommand
///
/// Properties:
/// * [customerPackageId] 
/// * [quantity] 
/// * [reasonCode] 
@BuiltValue()
abstract class AdjustmentCommand implements Built<AdjustmentCommand, AdjustmentCommandBuilder> {
  @BuiltValueField(wireName: r'customerPackageId')
  String get customerPackageId;

  @BuiltValueField(wireName: r'quantity')
  int get quantity;

  @BuiltValueField(wireName: r'reasonCode')
  AdjustmentCommandReasonCodeEnum get reasonCode;
  // enum reasonCodeEnum {  MIGRATION_CORRECTION,  ATTENDANCE_CORRECTION,  PACKAGE_COMPENSATION,  SUPPORT_RECONCILIATION,  };

  AdjustmentCommand._();

  factory AdjustmentCommand([void updates(AdjustmentCommandBuilder b)]) = _$AdjustmentCommand;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(AdjustmentCommandBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<AdjustmentCommand> get serializer => _$AdjustmentCommandSerializer();
}

class _$AdjustmentCommandSerializer implements PrimitiveSerializer<AdjustmentCommand> {
  @override
  final Iterable<Type> types = const [AdjustmentCommand, _$AdjustmentCommand];

  @override
  final String wireName = r'AdjustmentCommand';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    AdjustmentCommand object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'customerPackageId';
    yield serializers.serialize(
      object.customerPackageId,
      specifiedType: const FullType(String),
    );
    yield r'quantity';
    yield serializers.serialize(
      object.quantity,
      specifiedType: const FullType(int),
    );
    yield r'reasonCode';
    yield serializers.serialize(
      object.reasonCode,
      specifiedType: const FullType(AdjustmentCommandReasonCodeEnum),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    AdjustmentCommand object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required AdjustmentCommandBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'customerPackageId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.customerPackageId = valueDes;
          break;
        case r'quantity':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.quantity = valueDes;
          break;
        case r'reasonCode':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(AdjustmentCommandReasonCodeEnum),
          ) as AdjustmentCommandReasonCodeEnum;
          result.reasonCode = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  AdjustmentCommand deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = AdjustmentCommandBuilder();
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

class AdjustmentCommandReasonCodeEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'MIGRATION_CORRECTION')
  static const AdjustmentCommandReasonCodeEnum MIGRATION_CORRECTION = _$adjustmentCommandReasonCodeEnum_MIGRATION_CORRECTION;
  @BuiltValueEnumConst(wireName: r'ATTENDANCE_CORRECTION')
  static const AdjustmentCommandReasonCodeEnum ATTENDANCE_CORRECTION = _$adjustmentCommandReasonCodeEnum_ATTENDANCE_CORRECTION;
  @BuiltValueEnumConst(wireName: r'PACKAGE_COMPENSATION')
  static const AdjustmentCommandReasonCodeEnum PACKAGE_COMPENSATION = _$adjustmentCommandReasonCodeEnum_PACKAGE_COMPENSATION;
  @BuiltValueEnumConst(wireName: r'SUPPORT_RECONCILIATION')
  static const AdjustmentCommandReasonCodeEnum SUPPORT_RECONCILIATION = _$adjustmentCommandReasonCodeEnum_SUPPORT_RECONCILIATION;

  static Serializer<AdjustmentCommandReasonCodeEnum> get serializer => _$adjustmentCommandReasonCodeEnumSerializer;

  const AdjustmentCommandReasonCodeEnum._(String name): super(name);

  static BuiltSet<AdjustmentCommandReasonCodeEnum> get values => _$adjustmentCommandReasonCodeEnumValues;
  static AdjustmentCommandReasonCodeEnum valueOf(String name) => _$adjustmentCommandReasonCodeEnumValueOf(name);
}

