//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'mobile_features.g.dart';

/// MobileFeatures
///
/// Properties:
/// * [accountRecovery] 
/// * [revokeAllSessions] 
/// * [bookingCancellation] 
/// * [reschedule] 
/// * [customerCheckIn] 
/// * [instructorCheckIn] 
@BuiltValue()
abstract class MobileFeatures implements Built<MobileFeatures, MobileFeaturesBuilder> {
  @BuiltValueField(wireName: r'accountRecovery')
  bool get accountRecovery;

  @BuiltValueField(wireName: r'revokeAllSessions')
  bool get revokeAllSessions;

  @BuiltValueField(wireName: r'bookingCancellation')
  bool get bookingCancellation;

  @BuiltValueField(wireName: r'reschedule')
  bool get reschedule;

  @BuiltValueField(wireName: r'customerCheckIn')
  bool get customerCheckIn;

  @BuiltValueField(wireName: r'instructorCheckIn')
  bool get instructorCheckIn;

  MobileFeatures._();

  factory MobileFeatures([void updates(MobileFeaturesBuilder b)]) = _$MobileFeatures;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(MobileFeaturesBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<MobileFeatures> get serializer => _$MobileFeaturesSerializer();
}

class _$MobileFeaturesSerializer implements PrimitiveSerializer<MobileFeatures> {
  @override
  final Iterable<Type> types = const [MobileFeatures, _$MobileFeatures];

  @override
  final String wireName = r'MobileFeatures';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    MobileFeatures object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'accountRecovery';
    yield serializers.serialize(
      object.accountRecovery,
      specifiedType: const FullType(bool),
    );
    yield r'revokeAllSessions';
    yield serializers.serialize(
      object.revokeAllSessions,
      specifiedType: const FullType(bool),
    );
    yield r'bookingCancellation';
    yield serializers.serialize(
      object.bookingCancellation,
      specifiedType: const FullType(bool),
    );
    yield r'reschedule';
    yield serializers.serialize(
      object.reschedule,
      specifiedType: const FullType(bool),
    );
    yield r'customerCheckIn';
    yield serializers.serialize(
      object.customerCheckIn,
      specifiedType: const FullType(bool),
    );
    yield r'instructorCheckIn';
    yield serializers.serialize(
      object.instructorCheckIn,
      specifiedType: const FullType(bool),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    MobileFeatures object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required MobileFeaturesBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'accountRecovery':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(bool),
          ) as bool;
          result.accountRecovery = valueDes;
          break;
        case r'revokeAllSessions':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(bool),
          ) as bool;
          result.revokeAllSessions = valueDes;
          break;
        case r'bookingCancellation':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(bool),
          ) as bool;
          result.bookingCancellation = valueDes;
          break;
        case r'reschedule':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(bool),
          ) as bool;
          result.reschedule = valueDes;
          break;
        case r'customerCheckIn':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(bool),
          ) as bool;
          result.customerCheckIn = valueDes;
          break;
        case r'instructorCheckIn':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(bool),
          ) as bool;
          result.instructorCheckIn = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  MobileFeatures deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = MobileFeaturesBuilder();
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

