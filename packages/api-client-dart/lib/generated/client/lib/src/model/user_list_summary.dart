//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'user_list_summary.g.dart';

/// UserListSummary
///
/// Properties:
/// * [total] 
/// * [active] 
/// * [pendingActivation] 
/// * [inactive] 
@BuiltValue()
abstract class UserListSummary implements Built<UserListSummary, UserListSummaryBuilder> {
  @BuiltValueField(wireName: r'total')
  int get total;

  @BuiltValueField(wireName: r'active')
  int get active;

  @BuiltValueField(wireName: r'pendingActivation')
  int get pendingActivation;

  @BuiltValueField(wireName: r'inactive')
  int get inactive;

  UserListSummary._();

  factory UserListSummary([void updates(UserListSummaryBuilder b)]) = _$UserListSummary;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(UserListSummaryBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<UserListSummary> get serializer => _$UserListSummarySerializer();
}

class _$UserListSummarySerializer implements PrimitiveSerializer<UserListSummary> {
  @override
  final Iterable<Type> types = const [UserListSummary, _$UserListSummary];

  @override
  final String wireName = r'UserListSummary';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    UserListSummary object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'total';
    yield serializers.serialize(
      object.total,
      specifiedType: const FullType(int),
    );
    yield r'active';
    yield serializers.serialize(
      object.active,
      specifiedType: const FullType(int),
    );
    yield r'pendingActivation';
    yield serializers.serialize(
      object.pendingActivation,
      specifiedType: const FullType(int),
    );
    yield r'inactive';
    yield serializers.serialize(
      object.inactive,
      specifiedType: const FullType(int),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    UserListSummary object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required UserListSummaryBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'total':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.total = valueDes;
          break;
        case r'active':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.active = valueDes;
          break;
        case r'pendingActivation':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.pendingActivation = valueDes;
          break;
        case r'inactive':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.inactive = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  UserListSummary deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = UserListSummaryBuilder();
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

