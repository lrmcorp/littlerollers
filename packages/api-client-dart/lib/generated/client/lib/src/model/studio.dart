//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:openapi/src/model/room.dart';
import 'package:built_collection/built_collection.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'studio.g.dart';

/// Studio
///
/// Properties:
/// * [id] 
/// * [branchId] 
/// * [code] 
/// * [name] 
/// * [equipmentText] 
/// * [contactPhoneE164] 
/// * [active] 
/// * [rooms] 
@BuiltValue()
abstract class Studio implements Built<Studio, StudioBuilder> {
  @BuiltValueField(wireName: r'id')
  String get id;

  @BuiltValueField(wireName: r'branchId')
  String get branchId;

  @BuiltValueField(wireName: r'code')
  String get code;

  @BuiltValueField(wireName: r'name')
  String get name;

  @BuiltValueField(wireName: r'equipmentText')
  String? get equipmentText;

  @BuiltValueField(wireName: r'contactPhoneE164')
  String? get contactPhoneE164;

  @BuiltValueField(wireName: r'active')
  bool get active;

  @BuiltValueField(wireName: r'rooms')
  BuiltList<Room>? get rooms;

  Studio._();

  factory Studio([void updates(StudioBuilder b)]) = _$Studio;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(StudioBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<Studio> get serializer => _$StudioSerializer();
}

class _$StudioSerializer implements PrimitiveSerializer<Studio> {
  @override
  final Iterable<Type> types = const [Studio, _$Studio];

  @override
  final String wireName = r'Studio';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    Studio object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'id';
    yield serializers.serialize(
      object.id,
      specifiedType: const FullType(String),
    );
    yield r'branchId';
    yield serializers.serialize(
      object.branchId,
      specifiedType: const FullType(String),
    );
    yield r'code';
    yield serializers.serialize(
      object.code,
      specifiedType: const FullType(String),
    );
    yield r'name';
    yield serializers.serialize(
      object.name,
      specifiedType: const FullType(String),
    );
    if (object.equipmentText != null) {
      yield r'equipmentText';
      yield serializers.serialize(
        object.equipmentText,
        specifiedType: const FullType.nullable(String),
      );
    }
    if (object.contactPhoneE164 != null) {
      yield r'contactPhoneE164';
      yield serializers.serialize(
        object.contactPhoneE164,
        specifiedType: const FullType.nullable(String),
      );
    }
    yield r'active';
    yield serializers.serialize(
      object.active,
      specifiedType: const FullType(bool),
    );
    if (object.rooms != null) {
      yield r'rooms';
      yield serializers.serialize(
        object.rooms,
        specifiedType: const FullType(BuiltList, [FullType(Room)]),
      );
    }
  }

  @override
  Object serialize(
    Serializers serializers,
    Studio object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required StudioBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'id':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.id = valueDes;
          break;
        case r'branchId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.branchId = valueDes;
          break;
        case r'code':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.code = valueDes;
          break;
        case r'name':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.name = valueDes;
          break;
        case r'equipmentText':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.equipmentText = valueDes;
          break;
        case r'contactPhoneE164':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.contactPhoneE164 = valueDes;
          break;
        case r'active':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(bool),
          ) as bool;
          result.active = valueDes;
          break;
        case r'rooms':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(Room)]),
          ) as BuiltList<Room>;
          result.rooms.replace(valueDes);
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  Studio deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = StudioBuilder();
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

