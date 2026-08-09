//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'get_class_completion_control200_response.g.dart';

/// GetClassCompletionControl200Response
///
/// Properties:
/// * [classSlotId] 
/// * [expectedVersion] 
/// * [controlHash] 
/// * [attendanceCount] 
/// * [noShowCount] 
/// * [activeReservationCount] 
@BuiltValue()
abstract class GetClassCompletionControl200Response implements Built<GetClassCompletionControl200Response, GetClassCompletionControl200ResponseBuilder> {
  @BuiltValueField(wireName: r'classSlotId')
  String get classSlotId;

  @BuiltValueField(wireName: r'expectedVersion')
  int get expectedVersion;

  @BuiltValueField(wireName: r'controlHash')
  String get controlHash;

  @BuiltValueField(wireName: r'attendanceCount')
  int get attendanceCount;

  @BuiltValueField(wireName: r'noShowCount')
  int get noShowCount;

  @BuiltValueField(wireName: r'activeReservationCount')
  int get activeReservationCount;

  GetClassCompletionControl200Response._();

  factory GetClassCompletionControl200Response([void updates(GetClassCompletionControl200ResponseBuilder b)]) = _$GetClassCompletionControl200Response;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(GetClassCompletionControl200ResponseBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<GetClassCompletionControl200Response> get serializer => _$GetClassCompletionControl200ResponseSerializer();
}

class _$GetClassCompletionControl200ResponseSerializer implements PrimitiveSerializer<GetClassCompletionControl200Response> {
  @override
  final Iterable<Type> types = const [GetClassCompletionControl200Response, _$GetClassCompletionControl200Response];

  @override
  final String wireName = r'GetClassCompletionControl200Response';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    GetClassCompletionControl200Response object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'classSlotId';
    yield serializers.serialize(
      object.classSlotId,
      specifiedType: const FullType(String),
    );
    yield r'expectedVersion';
    yield serializers.serialize(
      object.expectedVersion,
      specifiedType: const FullType(int),
    );
    yield r'controlHash';
    yield serializers.serialize(
      object.controlHash,
      specifiedType: const FullType(String),
    );
    yield r'attendanceCount';
    yield serializers.serialize(
      object.attendanceCount,
      specifiedType: const FullType(int),
    );
    yield r'noShowCount';
    yield serializers.serialize(
      object.noShowCount,
      specifiedType: const FullType(int),
    );
    yield r'activeReservationCount';
    yield serializers.serialize(
      object.activeReservationCount,
      specifiedType: const FullType(int),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    GetClassCompletionControl200Response object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required GetClassCompletionControl200ResponseBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'classSlotId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.classSlotId = valueDes;
          break;
        case r'expectedVersion':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.expectedVersion = valueDes;
          break;
        case r'controlHash':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.controlHash = valueDes;
          break;
        case r'attendanceCount':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.attendanceCount = valueDes;
          break;
        case r'noShowCount':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.noShowCount = valueDes;
          break;
        case r'activeReservationCount':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.activeReservationCount = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  GetClassCompletionControl200Response deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = GetClassCompletionControl200ResponseBuilder();
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

