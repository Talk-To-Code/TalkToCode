package ast;
import java.util.*;

/**
 * @author SOON WEI JUN A0156192A
 * This class is mainly for construction of AST nodes representing a dictionary in a Python
 * Program and its respective syntax generation
 *
 */
public class ASTExpressionUnitLiteralDictionary extends ASTExpressionUnitLiteral{
	private static final String NODE_TYPE = "Dictionary";
	private HashMap<ASTExpressionUnitLiteral, ASTExpression> entries;
	
	public ASTExpressionUnitLiteralDictionary(){
		super();
		initialize();
	}

	public void addValue(ASTExpressionUnitLiteral key, ASTExpression value){
		this.entries.put(key, value);
		key.parent = this;
		value.parent = this;
	}
	private void initialize() {
		this.entries = new HashMap<ASTExpressionUnitLiteral, ASTExpression>();
	}
	public String typeof(){
		return super.typeof()+"->"+NODE_TYPE;
	}
	
	public String toSyntax() {
		this.result = "";
		this.result += "{";
		int index = 0;
		for(ASTExpressionUnitLiteral key : this.entries.keySet()){
			this.result+= key.toSyntax() + " : " + this.entries.get(key).toSyntax();
			if(index < this.entries.size()-1) this.result+= ", ";
			else this.result += "}";
			index++;
		}
		if(this.isQuoted) quote();
		return this.result;		
	}
}
