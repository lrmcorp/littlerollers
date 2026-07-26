//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/json_object.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'changed_status.g.dart';

/// ChangedStatus
///
/// Properties:
/// * [status] 
@BuiltValue()
abstract class ChangedStatus implements Built<ChangedStatus, ChangedStatusBuilder> {
  @BuiltValueField(wireName: r'status')
  JsonObject? get status;

  ChangedStatus._();

  factory ChangedStatus([void updates(ChangedStatusBuilder b)]) = _$ChangedStatus;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(ChangedStatusBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<ChangedStatus> get serializer => _$ChangedStatusSerializer();
}

class _$ChangedStatusSerializer implements PrimitiveSerializer<ChangedStatus> {
  @override
  final Iterable<Type> types = const [ChangedStatus, _$ChangedStatus];

  @override
  final String wireName = r'ChangedStatus';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    ChangedStatus object, {
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
    ChangedStatus object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required ChangedStatusBuilder result,
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
  ChangedStatus deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = ChangedStatusBuilder();
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

