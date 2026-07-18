//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'correction_command.g.dart';

/// CorrectionCommand
///
/// Properties:
/// * [branchId] 
/// * [currentPeriod] 
/// * [referencePeriod] 
/// * [amountRp] 
/// * [reason] 
@BuiltValue()
abstract class CorrectionCommand implements Built<CorrectionCommand, CorrectionCommandBuilder> {
  @BuiltValueField(wireName: r'branchId')
  String get branchId;

  @BuiltValueField(wireName: r'currentPeriod')
  String get currentPeriod;

  @BuiltValueField(wireName: r'referencePeriod')
  String get referencePeriod;

  @BuiltValueField(wireName: r'amountRp')
  int get amountRp;

  @BuiltValueField(wireName: r'reason')
  String get reason;

  CorrectionCommand._();

  factory CorrectionCommand([void updates(CorrectionCommandBuilder b)]) = _$CorrectionCommand;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(CorrectionCommandBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<CorrectionCommand> get serializer => _$CorrectionCommandSerializer();
}

class _$CorrectionCommandSerializer implements PrimitiveSerializer<CorrectionCommand> {
  @override
  final Iterable<Type> types = const [CorrectionCommand, _$CorrectionCommand];

  @override
  final String wireName = r'CorrectionCommand';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    CorrectionCommand object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
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
    yield r'amountRp';
    yield serializers.serialize(
      object.amountRp,
      specifiedType: const FullType(int),
    );
    yield r'reason';
    yield serializers.serialize(
      object.reason,
      specifiedType: const FullType(String),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    CorrectionCommand object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required CorrectionCommandBuilder result,
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
        case r'amountRp':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.amountRp = valueDes;
          break;
        case r'reason':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.reason = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  CorrectionCommand deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = CorrectionCommandBuilder();
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

