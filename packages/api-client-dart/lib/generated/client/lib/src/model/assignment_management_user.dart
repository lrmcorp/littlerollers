//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'assignment_management_user.g.dart';

/// AssignmentManagementUser
///
/// Properties:
/// * [id] 
/// * [displayName] 
/// * [phoneMasked] 
@BuiltValue()
abstract class AssignmentManagementUser implements Built<AssignmentManagementUser, AssignmentManagementUserBuilder> {
  @BuiltValueField(wireName: r'id')
  String get id;

  @BuiltValueField(wireName: r'displayName')
  String get displayName;

  @BuiltValueField(wireName: r'phoneMasked')
  String? get phoneMasked;

  AssignmentManagementUser._();

  factory AssignmentManagementUser([void updates(AssignmentManagementUserBuilder b)]) = _$AssignmentManagementUser;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(AssignmentManagementUserBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<AssignmentManagementUser> get serializer => _$AssignmentManagementUserSerializer();
}

class _$AssignmentManagementUserSerializer implements PrimitiveSerializer<AssignmentManagementUser> {
  @override
  final Iterable<Type> types = const [AssignmentManagementUser, _$AssignmentManagementUser];

  @override
  final String wireName = r'AssignmentManagementUser';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    AssignmentManagementUser object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'id';
    yield serializers.serialize(
      object.id,
      specifiedType: const FullType(String),
    );
    yield r'displayName';
    yield serializers.serialize(
      object.displayName,
      specifiedType: const FullType(String),
    );
    yield r'phoneMasked';
    yield object.phoneMasked == null ? null : serializers.serialize(
      object.phoneMasked,
      specifiedType: const FullType.nullable(String),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    AssignmentManagementUser object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required AssignmentManagementUserBuilder result,
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
        case r'displayName':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.displayName = valueDes;
          break;
        case r'phoneMasked':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.phoneMasked = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  AssignmentManagementUser deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = AssignmentManagementUserBuilder();
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

