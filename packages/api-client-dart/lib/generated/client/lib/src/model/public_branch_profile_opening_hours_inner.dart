//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'public_branch_profile_opening_hours_inner.g.dart';

/// PublicBranchProfileOpeningHoursInner
///
/// Properties:
/// * [days] 
/// * [hours] 
@BuiltValue()
abstract class PublicBranchProfileOpeningHoursInner implements Built<PublicBranchProfileOpeningHoursInner, PublicBranchProfileOpeningHoursInnerBuilder> {
  @BuiltValueField(wireName: r'days')
  String get days;

  @BuiltValueField(wireName: r'hours')
  String get hours;

  PublicBranchProfileOpeningHoursInner._();

  factory PublicBranchProfileOpeningHoursInner([void updates(PublicBranchProfileOpeningHoursInnerBuilder b)]) = _$PublicBranchProfileOpeningHoursInner;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(PublicBranchProfileOpeningHoursInnerBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<PublicBranchProfileOpeningHoursInner> get serializer => _$PublicBranchProfileOpeningHoursInnerSerializer();
}

class _$PublicBranchProfileOpeningHoursInnerSerializer implements PrimitiveSerializer<PublicBranchProfileOpeningHoursInner> {
  @override
  final Iterable<Type> types = const [PublicBranchProfileOpeningHoursInner, _$PublicBranchProfileOpeningHoursInner];

  @override
  final String wireName = r'PublicBranchProfileOpeningHoursInner';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    PublicBranchProfileOpeningHoursInner object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'days';
    yield serializers.serialize(
      object.days,
      specifiedType: const FullType(String),
    );
    yield r'hours';
    yield serializers.serialize(
      object.hours,
      specifiedType: const FullType(String),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    PublicBranchProfileOpeningHoursInner object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required PublicBranchProfileOpeningHoursInnerBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'days':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.days = valueDes;
          break;
        case r'hours':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.hours = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  PublicBranchProfileOpeningHoursInner deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = PublicBranchProfileOpeningHoursInnerBuilder();
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

