//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'public_schedule_summary_instructor.g.dart';

/// PublicScheduleSummaryInstructor
///
/// Properties:
/// * [displayName] 
@BuiltValue()
abstract class PublicScheduleSummaryInstructor implements Built<PublicScheduleSummaryInstructor, PublicScheduleSummaryInstructorBuilder> {
  @BuiltValueField(wireName: r'displayName')
  String get displayName;

  PublicScheduleSummaryInstructor._();

  factory PublicScheduleSummaryInstructor([void updates(PublicScheduleSummaryInstructorBuilder b)]) = _$PublicScheduleSummaryInstructor;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(PublicScheduleSummaryInstructorBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<PublicScheduleSummaryInstructor> get serializer => _$PublicScheduleSummaryInstructorSerializer();
}

class _$PublicScheduleSummaryInstructorSerializer implements PrimitiveSerializer<PublicScheduleSummaryInstructor> {
  @override
  final Iterable<Type> types = const [PublicScheduleSummaryInstructor, _$PublicScheduleSummaryInstructor];

  @override
  final String wireName = r'PublicScheduleSummaryInstructor';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    PublicScheduleSummaryInstructor object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'displayName';
    yield serializers.serialize(
      object.displayName,
      specifiedType: const FullType(String),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    PublicScheduleSummaryInstructor object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required PublicScheduleSummaryInstructorBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'displayName':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.displayName = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  PublicScheduleSummaryInstructor deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = PublicScheduleSummaryInstructorBuilder();
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

