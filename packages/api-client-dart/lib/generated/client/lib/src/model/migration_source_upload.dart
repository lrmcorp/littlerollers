//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'migration_source_upload.g.dart';

/// MigrationSourceUpload
///
/// Properties:
/// * [id] 
/// * [status] 
/// * [scanStatus] 
/// * [sha256] 
/// * [uploadUrl] - Issuance only; never log
@BuiltValue()
abstract class MigrationSourceUpload implements Built<MigrationSourceUpload, MigrationSourceUploadBuilder> {
  @BuiltValueField(wireName: r'id')
  String get id;

  @BuiltValueField(wireName: r'status')
  MigrationSourceUploadStatusEnum get status;
  // enum statusEnum {  ISSUED,  UPLOADED,  FINALIZED,  FAILED,  };

  @BuiltValueField(wireName: r'scanStatus')
  MigrationSourceUploadScanStatusEnum get scanStatus;
  // enum scanStatusEnum {  PENDING,  CLEAN,  REJECTED,  INFECTED,  ERROR,  };

  @BuiltValueField(wireName: r'sha256')
  String get sha256;

  /// Issuance only; never log
  @BuiltValueField(wireName: r'uploadUrl')
  String? get uploadUrl;

  MigrationSourceUpload._();

  factory MigrationSourceUpload([void updates(MigrationSourceUploadBuilder b)]) = _$MigrationSourceUpload;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(MigrationSourceUploadBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<MigrationSourceUpload> get serializer => _$MigrationSourceUploadSerializer();
}

class _$MigrationSourceUploadSerializer implements PrimitiveSerializer<MigrationSourceUpload> {
  @override
  final Iterable<Type> types = const [MigrationSourceUpload, _$MigrationSourceUpload];

  @override
  final String wireName = r'MigrationSourceUpload';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    MigrationSourceUpload object, {
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
      specifiedType: const FullType(MigrationSourceUploadStatusEnum),
    );
    yield r'scanStatus';
    yield serializers.serialize(
      object.scanStatus,
      specifiedType: const FullType(MigrationSourceUploadScanStatusEnum),
    );
    yield r'sha256';
    yield serializers.serialize(
      object.sha256,
      specifiedType: const FullType(String),
    );
    if (object.uploadUrl != null) {
      yield r'uploadUrl';
      yield serializers.serialize(
        object.uploadUrl,
        specifiedType: const FullType.nullable(String),
      );
    }
  }

  @override
  Object serialize(
    Serializers serializers,
    MigrationSourceUpload object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required MigrationSourceUploadBuilder result,
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
            specifiedType: const FullType(MigrationSourceUploadStatusEnum),
          ) as MigrationSourceUploadStatusEnum;
          result.status = valueDes;
          break;
        case r'scanStatus':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(MigrationSourceUploadScanStatusEnum),
          ) as MigrationSourceUploadScanStatusEnum;
          result.scanStatus = valueDes;
          break;
        case r'sha256':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.sha256 = valueDes;
          break;
        case r'uploadUrl':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.uploadUrl = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  MigrationSourceUpload deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = MigrationSourceUploadBuilder();
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

class MigrationSourceUploadStatusEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'ISSUED')
  static const MigrationSourceUploadStatusEnum ISSUED = _$migrationSourceUploadStatusEnum_ISSUED;
  @BuiltValueEnumConst(wireName: r'UPLOADED')
  static const MigrationSourceUploadStatusEnum UPLOADED = _$migrationSourceUploadStatusEnum_UPLOADED;
  @BuiltValueEnumConst(wireName: r'FINALIZED')
  static const MigrationSourceUploadStatusEnum FINALIZED = _$migrationSourceUploadStatusEnum_FINALIZED;
  @BuiltValueEnumConst(wireName: r'FAILED')
  static const MigrationSourceUploadStatusEnum FAILED = _$migrationSourceUploadStatusEnum_FAILED;

  static Serializer<MigrationSourceUploadStatusEnum> get serializer => _$migrationSourceUploadStatusEnumSerializer;

  const MigrationSourceUploadStatusEnum._(String name): super(name);

  static BuiltSet<MigrationSourceUploadStatusEnum> get values => _$migrationSourceUploadStatusEnumValues;
  static MigrationSourceUploadStatusEnum valueOf(String name) => _$migrationSourceUploadStatusEnumValueOf(name);
}

class MigrationSourceUploadScanStatusEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'PENDING')
  static const MigrationSourceUploadScanStatusEnum PENDING = _$migrationSourceUploadScanStatusEnum_PENDING;
  @BuiltValueEnumConst(wireName: r'CLEAN')
  static const MigrationSourceUploadScanStatusEnum CLEAN = _$migrationSourceUploadScanStatusEnum_CLEAN;
  @BuiltValueEnumConst(wireName: r'REJECTED')
  static const MigrationSourceUploadScanStatusEnum REJECTED = _$migrationSourceUploadScanStatusEnum_REJECTED;
  @BuiltValueEnumConst(wireName: r'INFECTED')
  static const MigrationSourceUploadScanStatusEnum INFECTED = _$migrationSourceUploadScanStatusEnum_INFECTED;
  @BuiltValueEnumConst(wireName: r'ERROR')
  static const MigrationSourceUploadScanStatusEnum ERROR = _$migrationSourceUploadScanStatusEnum_ERROR;

  static Serializer<MigrationSourceUploadScanStatusEnum> get serializer => _$migrationSourceUploadScanStatusEnumSerializer;

  const MigrationSourceUploadScanStatusEnum._(String name): super(name);

  static BuiltSet<MigrationSourceUploadScanStatusEnum> get values => _$migrationSourceUploadScanStatusEnumValues;
  static MigrationSourceUploadScanStatusEnum valueOf(String name) => _$migrationSourceUploadScanStatusEnumValueOf(name);
}

