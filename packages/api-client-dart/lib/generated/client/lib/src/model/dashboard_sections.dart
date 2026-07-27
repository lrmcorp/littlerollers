//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'dashboard_sections.g.dart';

/// DashboardSections
///
/// Properties:
/// * [executive] 
/// * [owner] 
/// * [branchOperations] 
/// * [finance] 
/// * [operations] 
/// * [trend] 
/// * [queue] 
/// * [risk] 
/// * [branchComparison] 
/// * [auditActivity] 
/// * [jobHealth] 
@BuiltValue()
abstract class DashboardSections implements Built<DashboardSections, DashboardSectionsBuilder> {
  @BuiltValueField(wireName: r'executive')
  bool get executive;

  @BuiltValueField(wireName: r'owner')
  bool get owner;

  @BuiltValueField(wireName: r'branchOperations')
  bool get branchOperations;

  @BuiltValueField(wireName: r'finance')
  bool get finance;

  @BuiltValueField(wireName: r'operations')
  bool get operations;

  @BuiltValueField(wireName: r'trend')
  bool get trend;

  @BuiltValueField(wireName: r'queue')
  bool get queue;

  @BuiltValueField(wireName: r'risk')
  bool get risk;

  @BuiltValueField(wireName: r'branchComparison')
  bool get branchComparison;

  @BuiltValueField(wireName: r'auditActivity')
  bool get auditActivity;

  @BuiltValueField(wireName: r'jobHealth')
  bool get jobHealth;

  DashboardSections._();

  factory DashboardSections([void updates(DashboardSectionsBuilder b)]) = _$DashboardSections;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(DashboardSectionsBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<DashboardSections> get serializer => _$DashboardSectionsSerializer();
}

class _$DashboardSectionsSerializer implements PrimitiveSerializer<DashboardSections> {
  @override
  final Iterable<Type> types = const [DashboardSections, _$DashboardSections];

  @override
  final String wireName = r'DashboardSections';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    DashboardSections object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'executive';
    yield serializers.serialize(
      object.executive,
      specifiedType: const FullType(bool),
    );
    yield r'owner';
    yield serializers.serialize(
      object.owner,
      specifiedType: const FullType(bool),
    );
    yield r'branchOperations';
    yield serializers.serialize(
      object.branchOperations,
      specifiedType: const FullType(bool),
    );
    yield r'finance';
    yield serializers.serialize(
      object.finance,
      specifiedType: const FullType(bool),
    );
    yield r'operations';
    yield serializers.serialize(
      object.operations,
      specifiedType: const FullType(bool),
    );
    yield r'trend';
    yield serializers.serialize(
      object.trend,
      specifiedType: const FullType(bool),
    );
    yield r'queue';
    yield serializers.serialize(
      object.queue,
      specifiedType: const FullType(bool),
    );
    yield r'risk';
    yield serializers.serialize(
      object.risk,
      specifiedType: const FullType(bool),
    );
    yield r'branchComparison';
    yield serializers.serialize(
      object.branchComparison,
      specifiedType: const FullType(bool),
    );
    yield r'auditActivity';
    yield serializers.serialize(
      object.auditActivity,
      specifiedType: const FullType(bool),
    );
    yield r'jobHealth';
    yield serializers.serialize(
      object.jobHealth,
      specifiedType: const FullType(bool),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    DashboardSections object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required DashboardSectionsBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'executive':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(bool),
          ) as bool;
          result.executive = valueDes;
          break;
        case r'owner':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(bool),
          ) as bool;
          result.owner = valueDes;
          break;
        case r'branchOperations':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(bool),
          ) as bool;
          result.branchOperations = valueDes;
          break;
        case r'finance':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(bool),
          ) as bool;
          result.finance = valueDes;
          break;
        case r'operations':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(bool),
          ) as bool;
          result.operations = valueDes;
          break;
        case r'trend':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(bool),
          ) as bool;
          result.trend = valueDes;
          break;
        case r'queue':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(bool),
          ) as bool;
          result.queue = valueDes;
          break;
        case r'risk':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(bool),
          ) as bool;
          result.risk = valueDes;
          break;
        case r'branchComparison':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(bool),
          ) as bool;
          result.branchComparison = valueDes;
          break;
        case r'auditActivity':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(bool),
          ) as bool;
          result.auditActivity = valueDes;
          break;
        case r'jobHealth':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(bool),
          ) as bool;
          result.jobHealth = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  DashboardSections deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = DashboardSectionsBuilder();
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

