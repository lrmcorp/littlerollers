//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'package_management_summary.g.dart';

/// PackageManagementSummary
///
/// Properties:
/// * [ACTIVE] 
/// * [SCHEDULED] 
/// * [EXPIRED] 
/// * [INACTIVE] 
@BuiltValue()
abstract class PackageManagementSummary implements Built<PackageManagementSummary, PackageManagementSummaryBuilder> {
  @BuiltValueField(wireName: r'ACTIVE')
  int? get ACTIVE;

  @BuiltValueField(wireName: r'SCHEDULED')
  int? get SCHEDULED;

  @BuiltValueField(wireName: r'EXPIRED')
  int? get EXPIRED;

  @BuiltValueField(wireName: r'INACTIVE')
  int? get INACTIVE;

  PackageManagementSummary._();

  factory PackageManagementSummary([void updates(PackageManagementSummaryBuilder b)]) = _$PackageManagementSummary;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(PackageManagementSummaryBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<PackageManagementSummary> get serializer => _$PackageManagementSummarySerializer();
}

class _$PackageManagementSummarySerializer implements PrimitiveSerializer<PackageManagementSummary> {
  @override
  final Iterable<Type> types = const [PackageManagementSummary, _$PackageManagementSummary];

  @override
  final String wireName = r'PackageManagementSummary';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    PackageManagementSummary object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    if (object.ACTIVE != null) {
      yield r'ACTIVE';
      yield serializers.serialize(
        object.ACTIVE,
        specifiedType: const FullType(int),
      );
    }
    if (object.SCHEDULED != null) {
      yield r'SCHEDULED';
      yield serializers.serialize(
        object.SCHEDULED,
        specifiedType: const FullType(int),
      );
    }
    if (object.EXPIRED != null) {
      yield r'EXPIRED';
      yield serializers.serialize(
        object.EXPIRED,
        specifiedType: const FullType(int),
      );
    }
    if (object.INACTIVE != null) {
      yield r'INACTIVE';
      yield serializers.serialize(
        object.INACTIVE,
        specifiedType: const FullType(int),
      );
    }
  }

  @override
  Object serialize(
    Serializers serializers,
    PackageManagementSummary object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required PackageManagementSummaryBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'ACTIVE':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.ACTIVE = valueDes;
          break;
        case r'SCHEDULED':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.SCHEDULED = valueDes;
          break;
        case r'EXPIRED':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.EXPIRED = valueDes;
          break;
        case r'INACTIVE':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.INACTIVE = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  PackageManagementSummary deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = PackageManagementSummaryBuilder();
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

