//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'end_assignment_command.g.dart';

/// EndAssignmentCommand
///
/// Properties:
/// * [effectiveAt] 
/// * [reason] 
/// * [expectedVersion] 
@BuiltValue()
abstract class EndAssignmentCommand implements Built<EndAssignmentCommand, EndAssignmentCommandBuilder> {
  @BuiltValueField(wireName: r'effectiveAt')
  DateTime get effectiveAt;

  @BuiltValueField(wireName: r'reason')
  String get reason;

  @BuiltValueField(wireName: r'expectedVersion')
  int? get expectedVersion;

  EndAssignmentCommand._();

  factory EndAssignmentCommand([void updates(EndAssignmentCommandBuilder b)]) = _$EndAssignmentCommand;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(EndAssignmentCommandBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<EndAssignmentCommand> get serializer => _$EndAssignmentCommandSerializer();
}

class _$EndAssignmentCommandSerializer implements PrimitiveSerializer<EndAssignmentCommand> {
  @override
  final Iterable<Type> types = const [EndAssignmentCommand, _$EndAssignmentCommand];

  @override
  final String wireName = r'EndAssignmentCommand';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    EndAssignmentCommand object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'effectiveAt';
    yield serializers.serialize(
      object.effectiveAt,
      specifiedType: const FullType(DateTime),
    );
    yield r'reason';
    yield serializers.serialize(
      object.reason,
      specifiedType: const FullType(String),
    );
    if (object.expectedVersion != null) {
      yield r'expectedVersion';
      yield serializers.serialize(
        object.expectedVersion,
        specifiedType: const FullType(int),
      );
    }
  }

  @override
  Object serialize(
    Serializers serializers,
    EndAssignmentCommand object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required EndAssignmentCommandBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'effectiveAt':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(DateTime),
          ) as DateTime;
          result.effectiveAt = valueDes;
          break;
        case r'reason':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.reason = valueDes;
          break;
        case r'expectedVersion':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.expectedVersion = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  EndAssignmentCommand deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = EndAssignmentCommandBuilder();
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

