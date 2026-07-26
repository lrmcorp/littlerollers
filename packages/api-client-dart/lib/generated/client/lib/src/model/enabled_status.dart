//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/json_object.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'enabled_status.g.dart';

/// EnabledStatus
///
/// Properties:
/// * [status] 
@BuiltValue()
abstract class EnabledStatus implements Built<EnabledStatus, EnabledStatusBuilder> {
  @BuiltValueField(wireName: r'status')
  JsonObject? get status;

  EnabledStatus._();

  factory EnabledStatus([void updates(EnabledStatusBuilder b)]) = _$EnabledStatus;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(EnabledStatusBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<EnabledStatus> get serializer => _$EnabledStatusSerializer();
}

class _$EnabledStatusSerializer implements PrimitiveSerializer<EnabledStatus> {
  @override
  final Iterable<Type> types = const [EnabledStatus, _$EnabledStatus];

  @override
  final String wireName = r'EnabledStatus';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    EnabledStatus object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'status';
    yield object.status == null ? null : serializers.serialize(
      object.status,
      specifiedType: const FullType.nullable(JsonObject),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    EnabledStatus object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required EnabledStatusBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'status':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(JsonObject),
          ) as JsonObject?;
          if (valueDes == null) continue;
          result.status = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  EnabledStatus deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = EnabledStatusBuilder();
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

