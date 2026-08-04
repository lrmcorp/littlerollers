//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'package_scope_command.g.dart';

/// PackageScopeCommand
///
/// Properties:
/// * [branchIds] 
/// * [classTypeIds] 
/// * [expectedVersion] 
/// * [reason] 
@BuiltValue()
abstract class PackageScopeCommand implements Built<PackageScopeCommand, PackageScopeCommandBuilder> {
  @BuiltValueField(wireName: r'branchIds')
  BuiltSet<String> get branchIds;

  @BuiltValueField(wireName: r'classTypeIds')
  BuiltSet<String> get classTypeIds;

  @BuiltValueField(wireName: r'expectedVersion')
  int get expectedVersion;

  @BuiltValueField(wireName: r'reason')
  String get reason;

  PackageScopeCommand._();

  factory PackageScopeCommand([void updates(PackageScopeCommandBuilder b)]) = _$PackageScopeCommand;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(PackageScopeCommandBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<PackageScopeCommand> get serializer => _$PackageScopeCommandSerializer();
}

class _$PackageScopeCommandSerializer implements PrimitiveSerializer<PackageScopeCommand> {
  @override
  final Iterable<Type> types = const [PackageScopeCommand, _$PackageScopeCommand];

  @override
  final String wireName = r'PackageScopeCommand';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    PackageScopeCommand object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'branchIds';
    yield serializers.serialize(
      object.branchIds,
      specifiedType: const FullType(BuiltSet, [FullType(String)]),
    );
    yield r'classTypeIds';
    yield serializers.serialize(
      object.classTypeIds,
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
    PackageScopeCommand object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required PackageScopeCommandBuilder result,
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
        case r'classTypeIds':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltSet, [FullType(String)]),
          ) as BuiltSet<String>;
          result.classTypeIds.replace(valueDes);
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
  PackageScopeCommand deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = PackageScopeCommandBuilder();
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

