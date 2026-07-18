//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'migration_batch_action_command.g.dart';

/// MigrationBatchActionCommand
///
/// Properties:
/// * [expectedVersion] 
/// * [controlHash] 
/// * [reason] 
@BuiltValue()
abstract class MigrationBatchActionCommand implements Built<MigrationBatchActionCommand, MigrationBatchActionCommandBuilder> {
  @BuiltValueField(wireName: r'expectedVersion')
  int get expectedVersion;

  @BuiltValueField(wireName: r'controlHash')
  String get controlHash;

  @BuiltValueField(wireName: r'reason')
  String get reason;

  MigrationBatchActionCommand._();

  factory MigrationBatchActionCommand([void updates(MigrationBatchActionCommandBuilder b)]) = _$MigrationBatchActionCommand;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(MigrationBatchActionCommandBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<MigrationBatchActionCommand> get serializer => _$MigrationBatchActionCommandSerializer();
}

class _$MigrationBatchActionCommandSerializer implements PrimitiveSerializer<MigrationBatchActionCommand> {
  @override
  final Iterable<Type> types = const [MigrationBatchActionCommand, _$MigrationBatchActionCommand];

  @override
  final String wireName = r'MigrationBatchActionCommand';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    MigrationBatchActionCommand object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
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
    yield r'reason';
    yield serializers.serialize(
      object.reason,
      specifiedType: const FullType(String),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    MigrationBatchActionCommand object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required MigrationBatchActionCommandBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
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
  MigrationBatchActionCommand deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = MigrationBatchActionCommandBuilder();
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

