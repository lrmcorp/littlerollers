//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:openapi/src/model/migration_control_totals.dart';
import 'package:built_collection/built_collection.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'migration_batch_result.g.dart';

/// MigrationBatchResult
///
/// Properties:
/// * [id] 
/// * [status] 
/// * [sourceChecksum] 
/// * [mappingVersion] 
/// * [totals] 
/// * [exceptionArtifactId] 
/// * [version] 
/// * [idempotentReplay] 
@BuiltValue()
abstract class MigrationBatchResult implements Built<MigrationBatchResult, MigrationBatchResultBuilder> {
  @BuiltValueField(wireName: r'id')
  String get id;

  @BuiltValueField(wireName: r'status')
  MigrationBatchResultStatusEnum get status;
  // enum statusEnum {  DRAFT,  VALIDATING,  VALIDATED,  APPLYING,  APPLIED,  RECONCILING,  RECONCILED,  ROLLING_BACK,  ROLLED_BACK,  FAILED,  };

  @BuiltValueField(wireName: r'sourceChecksum')
  String get sourceChecksum;

  @BuiltValueField(wireName: r'mappingVersion')
  String get mappingVersion;

  @BuiltValueField(wireName: r'totals')
  MigrationControlTotals get totals;

  @BuiltValueField(wireName: r'exceptionArtifactId')
  String? get exceptionArtifactId;

  @BuiltValueField(wireName: r'version')
  int get version;

  @BuiltValueField(wireName: r'idempotentReplay')
  bool get idempotentReplay;

  MigrationBatchResult._();

  factory MigrationBatchResult([void updates(MigrationBatchResultBuilder b)]) = _$MigrationBatchResult;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(MigrationBatchResultBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<MigrationBatchResult> get serializer => _$MigrationBatchResultSerializer();
}

class _$MigrationBatchResultSerializer implements PrimitiveSerializer<MigrationBatchResult> {
  @override
  final Iterable<Type> types = const [MigrationBatchResult, _$MigrationBatchResult];

  @override
  final String wireName = r'MigrationBatchResult';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    MigrationBatchResult object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'id';
    yield serializers.serialize(
      object.id,
      specifiedType: const FullType(String),
    );
    yield r'status';
    yield serializers.serialize(
      object.status,
      specifiedType: const FullType(MigrationBatchResultStatusEnum),
    );
    yield r'sourceChecksum';
    yield serializers.serialize(
      object.sourceChecksum,
      specifiedType: const FullType(String),
    );
    yield r'mappingVersion';
    yield serializers.serialize(
      object.mappingVersion,
      specifiedType: const FullType(String),
    );
    yield r'totals';
    yield serializers.serialize(
      object.totals,
      specifiedType: const FullType(MigrationControlTotals),
    );
    if (object.exceptionArtifactId != null) {
      yield r'exceptionArtifactId';
      yield serializers.serialize(
        object.exceptionArtifactId,
        specifiedType: const FullType.nullable(String),
      );
    }
    yield r'version';
    yield serializers.serialize(
      object.version,
      specifiedType: const FullType(int),
    );
    yield r'idempotentReplay';
    yield serializers.serialize(
      object.idempotentReplay,
      specifiedType: const FullType(bool),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    MigrationBatchResult object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required MigrationBatchResultBuilder result,
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
        case r'status':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(MigrationBatchResultStatusEnum),
          ) as MigrationBatchResultStatusEnum;
          result.status = valueDes;
          break;
        case r'sourceChecksum':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.sourceChecksum = valueDes;
          break;
        case r'mappingVersion':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.mappingVersion = valueDes;
          break;
        case r'totals':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(MigrationControlTotals),
          ) as MigrationControlTotals;
          result.totals.replace(valueDes);
          break;
        case r'exceptionArtifactId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.exceptionArtifactId = valueDes;
          break;
        case r'version':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.version = valueDes;
          break;
        case r'idempotentReplay':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(bool),
          ) as bool;
          result.idempotentReplay = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  MigrationBatchResult deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = MigrationBatchResultBuilder();
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

class MigrationBatchResultStatusEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'DRAFT')
  static const MigrationBatchResultStatusEnum DRAFT = _$migrationBatchResultStatusEnum_DRAFT;
  @BuiltValueEnumConst(wireName: r'VALIDATING')
  static const MigrationBatchResultStatusEnum VALIDATING = _$migrationBatchResultStatusEnum_VALIDATING;
  @BuiltValueEnumConst(wireName: r'VALIDATED')
  static const MigrationBatchResultStatusEnum VALIDATED = _$migrationBatchResultStatusEnum_VALIDATED;
  @BuiltValueEnumConst(wireName: r'APPLYING')
  static const MigrationBatchResultStatusEnum APPLYING = _$migrationBatchResultStatusEnum_APPLYING;
  @BuiltValueEnumConst(wireName: r'APPLIED')
  static const MigrationBatchResultStatusEnum APPLIED = _$migrationBatchResultStatusEnum_APPLIED;
  @BuiltValueEnumConst(wireName: r'RECONCILING')
  static const MigrationBatchResultStatusEnum RECONCILING = _$migrationBatchResultStatusEnum_RECONCILING;
  @BuiltValueEnumConst(wireName: r'RECONCILED')
  static const MigrationBatchResultStatusEnum RECONCILED = _$migrationBatchResultStatusEnum_RECONCILED;
  @BuiltValueEnumConst(wireName: r'ROLLING_BACK')
  static const MigrationBatchResultStatusEnum ROLLING_BACK = _$migrationBatchResultStatusEnum_ROLLING_BACK;
  @BuiltValueEnumConst(wireName: r'ROLLED_BACK')
  static const MigrationBatchResultStatusEnum ROLLED_BACK = _$migrationBatchResultStatusEnum_ROLLED_BACK;
  @BuiltValueEnumConst(wireName: r'FAILED')
  static const MigrationBatchResultStatusEnum FAILED = _$migrationBatchResultStatusEnum_FAILED;

  static Serializer<MigrationBatchResultStatusEnum> get serializer => _$migrationBatchResultStatusEnumSerializer;

  const MigrationBatchResultStatusEnum._(String name): super(name);

  static BuiltSet<MigrationBatchResultStatusEnum> get values => _$migrationBatchResultStatusEnumValues;
  static MigrationBatchResultStatusEnum valueOf(String name) => _$migrationBatchResultStatusEnumValueOf(name);
}

