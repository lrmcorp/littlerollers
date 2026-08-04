//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'class_type_scope_command.g.dart';

/// ClassTypeScopeCommand
///
/// Properties:
/// * [branchIds] 
/// * [expectedVersion] 
/// * [reason] 
@BuiltValue()
abstract class ClassTypeScopeCommand implements Built<ClassTypeScopeCommand, ClassTypeScopeCommandBuilder> {
  @BuiltValueField(wireName: r'branchIds')
  BuiltSet<String> get branchIds;

  @BuiltValueField(wireName: r'expectedVersion')
  int get expectedVersion;

  @BuiltValueField(wireName: r'reason')
  String get reason;

  ClassTypeScopeCommand._();

  factory ClassTypeScopeCommand([void updates(ClassTypeScopeCommandBuilder b)]) = _$ClassTypeScopeCommand;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(ClassTypeScopeCommandBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<ClassTypeScopeCommand> get serializer => _$ClassTypeScopeCommandSerializer();
}

class _$ClassTypeScopeCommandSerializer implements PrimitiveSerializer<ClassTypeScopeCommand> {
  @override
  final Iterable<Type> types = const [ClassTypeScopeCommand, _$ClassTypeScopeCommand];

  @override
  final String wireName = r'ClassTypeScopeCommand';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    ClassTypeScopeCommand object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'branchIds';
    yield serializers.serialize(
      object.branchIds,
      specifiedType: const FullType(BuiltSet, [FullType(String)]),
    );
    yield r'expectedVersion';
    yield serializers.serialize(
      object.expectedVersion,
      specifiedType: const FullType(int),
    );
    yield r'reason';
    yield serializers.serialize(
      object.reason,
      specifiedType: const FullType(String),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    ClassTypeScopeCommand object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required ClassTypeScopeCommandBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'branchIds':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltSet, [FullType(String)]),
          ) as BuiltSet<String>;
          result.branchIds.replace(valueDes);
          break;
        case r'expectedVersion':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.expectedVersion = valueDes;
          break;
        case r'reason':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.reason = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  ClassTypeScopeCommand deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = ClassTypeScopeCommandBuilder();
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

