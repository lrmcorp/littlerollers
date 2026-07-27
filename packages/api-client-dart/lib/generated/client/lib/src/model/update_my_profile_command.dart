//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'update_my_profile_command.g.dart';

/// UpdateMyProfileCommand
///
/// Properties:
/// * [displayName] 
/// * [preferredBranchId] 
/// * [expectedVersion] 
@BuiltValue()
abstract class UpdateMyProfileCommand implements Built<UpdateMyProfileCommand, UpdateMyProfileCommandBuilder> {
  @BuiltValueField(wireName: r'displayName')
  String get displayName;

  @BuiltValueField(wireName: r'preferredBranchId')
  String? get preferredBranchId;

  @BuiltValueField(wireName: r'expectedVersion')
  int get expectedVersion;

  UpdateMyProfileCommand._();

  factory UpdateMyProfileCommand([void updates(UpdateMyProfileCommandBuilder b)]) = _$UpdateMyProfileCommand;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(UpdateMyProfileCommandBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<UpdateMyProfileCommand> get serializer => _$UpdateMyProfileCommandSerializer();
}

class _$UpdateMyProfileCommandSerializer implements PrimitiveSerializer<UpdateMyProfileCommand> {
  @override
  final Iterable<Type> types = const [UpdateMyProfileCommand, _$UpdateMyProfileCommand];

  @override
  final String wireName = r'UpdateMyProfileCommand';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    UpdateMyProfileCommand object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'displayName';
    yield serializers.serialize(
      object.displayName,
      specifiedType: const FullType(String),
    );
    if (object.preferredBranchId != null) {
      yield r'preferredBranchId';
      yield serializers.serialize(
        object.preferredBranchId,
        specifiedType: const FullType.nullable(String),
      );
    }
    yield r'expectedVersion';
    yield serializers.serialize(
      object.expectedVersion,
      specifiedType: const FullType(int),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    UpdateMyProfileCommand object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required UpdateMyProfileCommandBuilder result,
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
        case r'preferredBranchId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.preferredBranchId = valueDes;
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
  UpdateMyProfileCommand deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = UpdateMyProfileCommandBuilder();
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

